import React from "react";

const H1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />;

const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />;

const H3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />;

const H4 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 {...props} />;

const Table = (props: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto my-6 not-prose">
    <table className="min-w-full divide-y divide-border" {...props} />
  </div>
);

const Thead = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className="bg-muted/50" {...props} />;

const Tbody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y divide-border" {...props} />
);

const Tr = (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />;

const Th = (props: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground" {...props} />
);

const Td = (props: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className="px-4 py-3 text-sm text-foreground" {...props} />
);

const Blockquote = (props: React.HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote className="border-l-4 border-violet-500 bg-violet-500/5 pl-4 pr-4 py-2 my-6 not-prose" {...props} />
);

const Hr = (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-8 border-border" {...props} />;

const Pre = (props: React.HTMLAttributes<HTMLPreElement>) => (
  <pre className="overflow-x-auto rounded-lg bg-muted p-4 my-6" {...props} />
);

const Code = (props: React.HTMLAttributes<HTMLElement>) => {
  if (!props.className) {
    return <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props} />;
  }
  return <code {...props} />;
};

const A = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isExternal = props.href?.startsWith("http");
  return (
    <a
      {...props}
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    />
  );
};

export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  blockquote: Blockquote,
  hr: Hr,
  pre: Pre,
  code: Code,
  a: A,
};
