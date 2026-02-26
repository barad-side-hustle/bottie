import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const REFERENCE_LOCALE = "en";
const LOCALE_FILES = ["en.json", "he.json", "es.json"];
const MESSAGES_DIR = "messages";
const SOURCE_GLOBS = ["src/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"];
const IGNORE_PATTERNS = ["node_modules/**", ".next/**", "**/*.test.ts", "scripts/**"];

const IGNORED_NAMESPACES_FOR_UNUSED = ["emails", "dashboard.insights.categories", "invitation"];

function flattenJSON(obj: unknown, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  if (obj === null || obj === undefined) return result;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const key = prefix ? `${prefix}.${i}` : `${i}`;
      if (typeof obj[i] === "object" && obj[i] !== null) {
        for (const [k, v] of flattenJSON(obj[i], key)) result.set(k, v);
      } else {
        result.set(key, String(obj[i]));
      }
    }
    return result;
  }

  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "object" && v !== null) {
        for (const [flatKey, flatVal] of flattenJSON(v, key)) result.set(flatKey, flatVal);
      } else {
        result.set(key, String(v));
      }
    }
  }

  return result;
}

interface MissingResult {
  locale: string;
  missing: string[];
  extra: string[];
}

function checkMissingTranslations(): MissingResult[] {
  const results: MissingResult[] = [];
  const refPath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
  const refJSON = JSON.parse(fs.readFileSync(refPath, "utf8"));
  const refKeys = new Set(flattenJSON(refJSON).keys());

  for (const file of LOCALE_FILES) {
    const locale = file.replace(".json", "");
    if (locale === REFERENCE_LOCALE) continue;

    const localePath = path.join(MESSAGES_DIR, file);
    const localeJSON = JSON.parse(fs.readFileSync(localePath, "utf8"));
    const localeKeys = new Set(flattenJSON(localeJSON).keys());

    const missing = [...refKeys].filter((k) => !localeKeys.has(k)).sort();
    const extra = [...localeKeys].filter((k) => !refKeys.has(k)).sort();

    results.push({ locale, missing, extra });
  }

  return results;
}

function extractNamespaceDeclarations(content: string): Map<string, string> {
  const varToNamespace = new Map<string, string>();

  const useTransRe = /(?:const|let)\s+(\w+)\s*=\s*useTranslations\((?:["']([^"']*)["'])?\)/g;
  let match;
  while ((match = useTransRe.exec(content)) !== null) {
    varToNamespace.set(match[1], match[2] ?? "");
  }

  const getTransRe =
    /(?:const|let)\s+(\w+)\s*=\s*await\s+getTranslations\(\{[^}]*namespace:\s*["']([^"']+)["'][^}]*\}\)/g;
  while ((match = getTransRe.exec(content)) !== null) {
    varToNamespace.set(match[1], match[2]);
  }

  return varToNamespace;
}

function templateToRegex(template: string): RegExp {
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\$\\\{[^}]*\\\}/g, "[^.]+");
  return new RegExp(`^${escaped}$`);
}

interface DynamicPattern {
  namespace: string;
  pattern: RegExp;
}

function extractKeyUsages(
  content: string,
  varToNamespace: Map<string, string>
): {
  usedKeys: string[];
  dynamicPatterns: DynamicPattern[];
} {
  const usedKeys: string[] = [];
  const dynamicPatterns: DynamicPattern[] = [];

  for (const [varName, namespace] of varToNamespace) {
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const staticRe = new RegExp(`${escaped}(?:\\.(?:raw|rich|markup))?\\(\\s*["']([^"']+)["']`, "g");
    let match;
    while ((match = staticRe.exec(content)) !== null) {
      const fullKey = namespace ? `${namespace}.${match[1]}` : match[1];
      usedKeys.push(fullKey);
    }

    const templateRe = new RegExp(`${escaped}(?:\\.(?:raw|rich|markup))?\\(\\s*\`([^\\x60]+)\``, "g");
    while ((match = templateRe.exec(content)) !== null) {
      const template = match[1];
      if (template.includes("${")) {
        dynamicPatterns.push({ namespace, pattern: templateToRegex(template) });
      } else {
        const fullKey = namespace ? `${namespace}.${template}` : template;
        usedKeys.push(fullKey);
      }
    }
  }

  return { usedKeys, dynamicPatterns };
}

function scanForStringLiteralKeys(files: string[], validKeys: Set<string>): Set<string> {
  const found = new Set<string>();

  const dottedRe = /["']([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+)["']/g;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    let match;
    while ((match = dottedRe.exec(content)) !== null) {
      const literal = match[1];
      if (validKeys.has(literal)) {
        found.add(literal);
      }
    }
  }

  return found;
}

function scanNamespacedStringLiterals(files: string[], validKeys: Set<string>): Set<string> {
  const found = new Set<string>();

  const anyStringRe = /["']([a-zA-Z_][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_.-]+)*)["']/g;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const namespaces = extractNamespaceDeclarations(content);
    if (namespaces.size === 0) continue;

    const nsValues = new Set(namespaces.values());
    let match;
    while ((match = anyStringRe.exec(content)) !== null) {
      const literal = match[1];
      if (validKeys.has(literal)) {
        found.add(literal);
        continue;
      }
      for (const ns of nsValues) {
        if (!ns) continue;
        const fullKey = `${ns}.${literal}`;
        if (validKeys.has(fullKey)) {
          found.add(fullKey);
        }
      }
    }
  }

  return found;
}

function scanForParameterTranslationCalls(
  files: string[],
  validKeys: Set<string>,
  declaredFiles: Set<string>
): Set<string> {
  const found = new Set<string>();

  const suffixIndex = new Map<string, string[]>();
  for (const key of validKeys) {
    const lastDot = key.lastIndexOf(".");
    if (lastDot !== -1) {
      const suffix = key.slice(lastDot + 1);
      const existing = suffixIndex.get(suffix) ?? [];
      existing.push(key);
      suffixIndex.set(suffix, existing);
    }
  }

  const paramCallRe = /\bt(?:\.(?:raw|rich|markup))?\(\s*["']([^"']+)["']/g;

  for (const file of files) {
    if (declaredFiles.has(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    if (!/\bt\s*:/.test(content)) continue;

    let match;
    while ((match = paramCallRe.exec(content)) !== null) {
      const subKey = match[1];
      if (validKeys.has(subKey)) {
        found.add(subKey);
        continue;
      }
      const matches = suffixIndex.get(subKey);
      if (matches) {
        for (const key of matches) found.add(key);
      }
    }
  }

  return found;
}

async function checkUnusedTranslations(): Promise<{
  unused: string[];
  ignoredSkipped: { namespace: string; keyCount: number }[];
}> {
  const refPath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
  const refJSON = JSON.parse(fs.readFileSync(refPath, "utf8"));
  const allKeys = flattenJSON(refJSON);
  const allKeySet = new Set(allKeys.keys());

  const files: string[] = [];
  for (const pattern of SOURCE_GLOBS) {
    const matches = await glob(pattern, { ignore: IGNORE_PATTERNS, cwd: process.cwd() });
    files.push(...matches);
  }

  const allUsedKeys = new Set<string>();
  const allDynamicPatterns: DynamicPattern[] = [];
  const declaredFiles = new Set<string>();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const varToNamespace = extractNamespaceDeclarations(content);
    if (varToNamespace.size === 0) continue;

    declaredFiles.add(file);
    const { usedKeys, dynamicPatterns } = extractKeyUsages(content, varToNamespace);
    for (const key of usedKeys) allUsedKeys.add(key);
    allDynamicPatterns.push(...dynamicPatterns);
  }

  const literalKeys = scanForStringLiteralKeys(files, allKeySet);
  for (const key of literalKeys) allUsedKeys.add(key);

  const paramKeys = scanForParameterTranslationCalls(files, allKeySet, declaredFiles);
  for (const key of paramKeys) allUsedKeys.add(key);

  const namespacedKeys = scanNamespacedStringLiterals(files, allKeySet);
  for (const key of namespacedKeys) allUsedKeys.add(key);

  const ignoredKeys = new Set<string>();
  const ignoredStats: { namespace: string; keyCount: number }[] = [];
  for (const ns of IGNORED_NAMESPACES_FOR_UNUSED) {
    const prefix = `${ns}.`;
    let count = 0;
    for (const key of allKeySet) {
      if (key === ns || key.startsWith(prefix)) {
        ignoredKeys.add(key);
        count++;
      }
    }
    if (count > 0) ignoredStats.push({ namespace: ns, keyCount: count });
  }

  const patternMatchedKeys = new Set<string>();
  for (const { namespace, pattern } of allDynamicPatterns) {
    const prefix = namespace ? `${namespace}.` : "";
    for (const key of allKeySet) {
      if (!key.startsWith(prefix)) continue;
      const relativeKey = namespace ? key.slice(prefix.length) : key;
      if (pattern.test(relativeKey)) patternMatchedKeys.add(key);
    }
  }

  const unused: string[] = [];
  for (const key of allKeySet) {
    if (ignoredKeys.has(key)) continue;
    if (allUsedKeys.has(key)) continue;
    if (patternMatchedKeys.has(key)) continue;

    let isChildOfUsed = false;
    for (const usedKey of allUsedKeys) {
      if (key.startsWith(`${usedKey}.`)) {
        isChildOfUsed = true;
        break;
      }
    }
    if (isChildOfUsed) continue;

    unused.push(key);
  }

  return { unused: unused.sort(), ignoredSkipped: ignoredStats };
}

async function main() {
  console.log("Translation Check");
  console.log("=================\n");

  let hasErrors = false;

  console.log("--- Missing Translations ---\n");
  const missingResults = checkMissingTranslations();
  let totalMissing = 0;
  let totalExtra = 0;

  for (const { locale, missing, extra } of missingResults) {
    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ${locale}.json: OK`);
      continue;
    }

    if (missing.length > 0) {
      totalMissing += missing.length;
      console.log(
        `  ${locale}.json — ${missing.length} missing (in ${REFERENCE_LOCALE}.json but not in ${locale}.json):`
      );
      for (const key of missing) console.log(`    - ${key}`);
    }

    if (extra.length > 0) {
      totalExtra += extra.length;
      console.log(`  ${locale}.json — ${extra.length} extra (in ${locale}.json but not in ${REFERENCE_LOCALE}.json):`);
      for (const key of extra) console.log(`    + ${key}`);
    }

    console.log();
  }

  if (totalMissing > 0 || totalExtra > 0) hasErrors = true;

  console.log("\n--- Unused Translations ---\n");
  const { unused, ignoredSkipped } = await checkUnusedTranslations();

  if (unused.length > 0) {
    hasErrors = true;
    console.log(`  Potentially unused (${unused.length} keys):`);
    for (const key of unused) console.log(`    - ${key}`);
  } else {
    console.log("  No unused translations found.");
  }

  if (ignoredSkipped.length > 0) {
    console.log(`\n  Ignored namespaces:`);
    for (const { namespace, keyCount } of ignoredSkipped) {
      console.log(`    ~ ${namespace} (${keyCount} keys)`);
    }
  }

  console.log("\n--- Summary ---\n");
  console.log(`  Missing translations: ${totalMissing} keys`);
  console.log(`  Extra translations:   ${totalExtra} keys`);
  console.log(`  Unused translations:  ${unused.length} keys`);
  console.log(`  Ignored (skipped):    ${ignoredSkipped.reduce((a, b) => a + b.keyCount, 0)} keys`);

  if (hasErrors) {
    console.log("\n  Result: FAIL\n");
    process.exit(1);
  } else {
    console.log("\n  Result: PASS\n");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
