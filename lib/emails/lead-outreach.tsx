import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Font,
  Hr,
  Button,
} from "@react-email/components";
import type { Locale } from "@/lib/locale";

interface LeadOutreachEmailProps {
  businessName: string;
  city: string;
  locale: Locale;
  ctaUrl: string;
}

const content: Record<
  string,
  {
    preview: (name: string) => string;
    greeting: (name: string) => string;
    intro: (city: string) => string;
    noticed: string;
    howItWorksTitle: string;
    step1: string;
    step2: string;
    step3: string;
    valueProposition: string;
    freeTier: string;
    ctaText: string;
    questions: string;
    signoff: string;
    founderTitle: string;
    unsubscribe: string;
  }
> = {
  he: {
    preview: (name) => `${name}, מגיבים לביקורות גוגל בשבילכם`,
    greeting: (name) => `שלום ${name},`,
    intro: (city) =>
      `שמי אלון. הקמתי את Bottie.ai כי ראיתי כמה זמן עסקים ב${city} מבזבזים על מענה לביקורות בגוגל.`,
    noticed: "שמתי לב שיש לכם פרופיל עסקי בגוגל, ורציתי לשתף איך אפשר לטפל בביקורות בלי להשקיע בזה שעות כל שבוע.",
    howItWorksTitle: "איך זה עובד:",
    step1: "1. מחברים את הפרופיל העסקי - תוך דקה, בלי הגדרות מסובכות.",
    step2: "2. ביקורת חדשה נכנסת - המערכת מזהה אותה מיד ומייצרת תגובה בעברית, בטון שמתאים לעסק שלכם.",
    step3: "3. אתם מאשרים ומפרסמים - או נותנים למערכת לפרסם אוטומטית. הבחירה שלכם.",
    valueProposition:
      "עסקים שמגיבים לביקורות מקבלים יותר לקוחות חדשים. גוגל מעדיף עסקים פעילים בתוצאות החיפוש. הבעיה היא שלבעלי מסעדות אין זמן לשבת ולכתוב תגובות כל יום.",
    freeTier: "Bottie פותר את זה. 5 תגובות בחודש בחינם, בלי כרטיס אשראי.",
    ctaText: "לנסות בחינם",
    questions: "יש שאלות? פשוט השיבו למייל הזה. אני קורא הכל.",
    signoff: "אלון",
    founderTitle: "מייסד, Bottie.ai",
    unsubscribe: 'קיבלתם את המייל הזה כי לעסק שלכם יש פרופיל עסקי בגוגל. לא מעוניינים? השיבו עם המילה "הסר".',
  },
  en: {
    preview: (name) => `${name}, we reply to your Google reviews for you`,
    greeting: (name) => `Hi ${name},`,
    intro: (city) =>
      `I'm Alon. I built Bottie.ai because I saw how much time businesses in ${city} spend replying to Google reviews.`,
    noticed:
      "I noticed you have a Google Business Profile and wanted to share how you can handle reviews without spending hours every week.",
    howItWorksTitle: "How it works:",
    step1: "1. Connect your Business Profile — takes one minute, no complex setup.",
    step2: "2. A new review comes in — our system detects it instantly and drafts a reply in your tone of voice.",
    step3: "3. You approve and publish — or let the system publish automatically. Your choice.",
    valueProposition:
      "Businesses that respond to reviews get more new customers. Google favors active businesses in search results. The problem is that business owners don't have time to write responses every day.",
    freeTier: "Bottie solves that. 5 replies per month for free, no credit card required.",
    ctaText: "Try it free",
    questions: "Questions? Just reply to this email. I read everything.",
    signoff: "Alon",
    founderTitle: "Founder, Bottie.ai",
    unsubscribe:
      'You received this email because your business has a Google Business Profile. Not interested? Reply with "unsubscribe".',
  },
  es: {
    preview: (name) => `${name}, respondemos a tus reseñas de Google por ti`,
    greeting: (name) => `Hola ${name},`,
    intro: (city) =>
      `Soy Alon. Creé Bottie.ai porque vi cuánto tiempo pierden los negocios en ${city} respondiendo reseñas de Google.`,
    noticed:
      "Vi que tienes un Perfil de Negocio en Google y quería compartir cómo puedes gestionar las reseñas sin dedicar horas cada semana.",
    howItWorksTitle: "Cómo funciona:",
    step1: "1. Conecta tu Perfil de Negocio — toma un minuto, sin configuración complicada.",
    step2: "2. Llega una nueva reseña — nuestro sistema la detecta al instante y redacta una respuesta con tu tono de voz.",
    step3: "3. Apruebas y publicas — o dejas que el sistema publique automáticamente. Tú decides.",
    valueProposition:
      "Los negocios que responden a las reseñas consiguen más clientes nuevos. Google favorece a los negocios activos en los resultados de búsqueda. El problema es que los dueños de negocios no tienen tiempo para escribir respuestas todos los días.",
    freeTier: "Bottie lo resuelve. 5 respuestas al mes gratis, sin tarjeta de crédito.",
    ctaText: "Pruébalo gratis",
    questions: "¿Preguntas? Simplemente responde a este correo. Leo todo.",
    signoff: "Alon",
    founderTitle: "Fundador, Bottie.ai",
    unsubscribe:
      'Recibiste este correo porque tu negocio tiene un Perfil de Negocio en Google. ¿No te interesa? Responde con "cancelar".',
  },
};

const dirMap: Record<string, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
  es: "ltr",
};

export function getOutreachSubject(locale: Locale, businessName: string): string {
  switch (locale) {
    case "he":
      return `ניהול ביקורות גוגל אוטומטי ל${businessName}`;
    case "es":
      return `Gestión automática de reseñas de Google para ${businessName}`;
    default:
      return `Automated Google review management for ${businessName}`;
  }
}

export default function LeadOutreachEmail({ businessName, city, locale, ctaUrl }: LeadOutreachEmailProps) {
  const c = content[locale] || content.en;
  const dir = dirMap[locale] || "ltr";

  return (
    <Html dir={dir} lang={locale}>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                background: "#0f172a",
                foreground: "#e0e7ff",
                primary: "#3a93e6",
                card: "#1e1b4b",
                border: "#2e1065",
                muted: "#cbd5e1",
                highlight: "#eab308",
              },
              fontFamily: {
                sans: ["Tomorrow", "sans-serif"],
              },
            },
          },
        }}
      >
        <Head>
          <Font
            fontFamily="Tomorrow"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/tomorrow/v19/WBLmrETPbHuZ_Zmsng56.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Tomorrow"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/tomorrow/v19/WBLmrETPbHuZ_Zmsng56.woff2",
              format: "woff2",
            }}
            fontWeight={600}
            fontStyle="normal"
          />
        </Head>
        <Preview>{c.preview(businessName)}</Preview>
        <Body className="bg-background my-auto mx-auto font-sans px-2 text-foreground">
          <Container className="border border-solid border-border rounded-lg my-[40px] mx-auto p-[20px] max-w-[600px] bg-card">
            <Section className="mt-4 mb-6 text-center">
              <Img
                src="https://bottie.ai/images/logo-full.svg"
                alt="Bottie.ai"
                width="120"
                height="auto"
                className="mx-auto"
              />
            </Section>

            <Section className="mb-6">
              <Text className="text-foreground text-base font-bold m-0 mb-4">{c.greeting(businessName)}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">{c.intro(city)}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">{c.noticed}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground font-bold text-sm mb-4 m-0">{c.howItWorksTitle}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">{c.step1.split(" - ")[0]}</span>
                {c.step1.includes(" - ") ? ` - ${c.step1.split(" - ").slice(1).join(" - ")}` : ""}
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">{c.step2.split(" - ")[0]}</span>
                {c.step2.includes(" - ") ? ` - ${c.step2.split(" - ").slice(1).join(" - ")}` : ""}
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">{c.step3.split(" - ")[0]}</span>
                {c.step3.includes(" - ") ? ` - ${c.step3.split(" - ").slice(1).join(" - ")}` : ""}
              </Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">{c.valueProposition}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">{c.freeTier}</Text>
            </Section>

            <Section className="text-center mb-6">
              <Button
                href={ctaUrl}
                className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-lg"
              >
                {c.ctaText}
              </Button>
            </Section>

            <Section className="mb-4">
              <Text className="text-muted text-sm leading-relaxed m-0">{c.questions}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-4">{c.signoff}</Text>
              <Text className="text-muted text-xs m-0">{c.founderTitle}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-4" />

            <Section className="mt-4">
              <Text className="text-muted text-xs text-center">{c.unsubscribe}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

LeadOutreachEmail.PreviewProps = {
  businessName: "מסעדת השף",
  city: "תל אביב",
  locale: "he" as Locale,
  ctaUrl: "https://bottie.ai/he",
} as LeadOutreachEmailProps;
