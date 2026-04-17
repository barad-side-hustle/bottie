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
    greeting: string;
    intro: (name: string, city: string) => string;
    whatYouGet: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    allFree: string;
    ctaText: string;
    questions: string;
    signoff: string;
    founderTitle: string;
    unsubscribe: string;
  }
> = {
  he: {
    preview: (name) => `${name} -3 כלים חינמיים לניהול ביקורות גוגל`,
    greeting: "שלום,",
    intro: (name, city) =>
      `שמי אלון, מייסד Bottie.ai. שמתי לב שיש ל${name} פרופיל עסקי בגוגל ורציתי להציע 3 כלים חינמיים שעוזרים לעסקים ב${city} לנהל ביקורות.`,
    whatYouGet: "מה מקבלים:",
    benefit1: "תגובות אוטומטיות לביקורות -בעברית, בטון שמתאים לעסק שלכם. אתם מאשרים ומפרסמים בקליק.",
    benefit2: "פילוח סנטימנט מהביקורות -תבינו מה הלקוחות אוהבים ואיפה כדאי להשתפר.",
    benefit3: "כלים לקבלת ביקורות חדשות -עוזרים ללקוחות מרוצים להשאיר ביקורת בגוגל.",
    allFree: "הכל חינמי לגמרי. בלי כרטיס אשראי, בלי התחייבות.",
    ctaText: "לנסות בחינם",
    questions: "שאלות? פשוט השיבו למייל הזה.",
    signoff: "אלון",
    founderTitle: "מייסד, Bottie.ai",
    unsubscribe: 'קיבלתם את המייל הזה כי לעסק שלכם יש פרופיל בגוגל. לא מעוניינים? השיבו "הסר".',
  },
  en: {
    preview: (name) => `${name} -3 free tools to manage your Google reviews`,
    greeting: "Hi there,",
    intro: (name, city) =>
      `I'm Alon, founder of Bottie.ai. I noticed ${name} has a Google Business Profile and wanted to offer 3 free tools that help businesses in ${city} manage their reviews.`,
    whatYouGet: "What you get:",
    benefit1: "Automatic review replies -drafted in your tone of voice. You approve and publish in one click.",
    benefit2: "Sentiment analysis -understand what customers love and where to improve.",
    benefit3: "Tools to get more reviews -help happy customers leave a Google review.",
    allFree: "Completely free. No credit card, no commitment.",
    ctaText: "Try it free",
    questions: "Questions? Just reply to this email.",
    signoff: "Alon",
    founderTitle: "Founder, Bottie.ai",
    unsubscribe:
      'You received this email because your business has a Google Business Profile. Not interested? Reply "unsubscribe".',
  },
  es: {
    preview: (name) => `${name} -3 herramientas gratuitas para gestionar tus reseñas de Google`,
    greeting: "Hola,",
    intro: (name, city) =>
      `Soy Alon, fundador de Bottie.ai. Vi que ${name} tiene un Perfil de Negocio en Google y quería ofrecer 3 herramientas gratuitas que ayudan a negocios en ${city} a gestionar sus reseñas.`,
    whatYouGet: "Qué obtienes:",
    benefit1: "Respuestas automáticas a reseñas -redactadas en tu tono de voz. Apruebas y publicas en un clic.",
    benefit2: "Análisis de sentimiento -entiende qué aman tus clientes y dónde mejorar.",
    benefit3: "Herramientas para obtener más reseñas -ayuda a clientes satisfechos a dejar una reseña en Google.",
    allFree: "Completamente gratis. Sin tarjeta de crédito, sin compromiso.",
    ctaText: "Pruébalo gratis",
    questions: "¿Preguntas? Simplemente responde a este correo.",
    signoff: "Alon",
    founderTitle: "Fundador, Bottie.ai",
    unsubscribe:
      'Recibiste este correo porque tu negocio tiene un Perfil de Negocio en Google. ¿No te interesa? Responde "cancelar".',
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
      return `3 כלים חינמיים לניהול ביקורות גוגל -${businessName}`;
    case "es":
      return `3 herramientas gratuitas para reseñas de Google -${businessName}`;
    default:
      return `3 free tools for your Google reviews -${businessName}`;
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
              url: "https://bottie.ai/fonts/tomorrow-400.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Tomorrow"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://bottie.ai/fonts/tomorrow-400.woff2",
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
              <Text className="text-foreground text-base font-bold m-0 mb-4">{c.greeting}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">{c.intro(businessName, city)}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground font-bold text-sm mb-4 m-0">{c.whatYouGet}</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">1.</span> {c.benefit1}
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">2.</span> {c.benefit2}
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">3.</span> {c.benefit3}
              </Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground text-sm font-bold leading-relaxed m-0 mb-4">{c.allFree}</Text>
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
