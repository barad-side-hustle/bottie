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

interface LeadOutreachEmailProps {
  businessName: string;
  city: string;
}

export default function LeadOutreachEmail({ businessName, city }: LeadOutreachEmailProps) {
  const previewText = `${businessName}, מגיבים לביקורות גוגל בשבילכם`;

  return (
    <Html dir="rtl" lang="he">
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
        <Preview>{previewText}</Preview>
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
              <Text className="text-foreground text-base font-bold m-0 mb-4">שלום {businessName},</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                שמי אלון. הקמתי את Bottie.ai כי ראיתי כמה זמן עסקים ב{city} מבזבזים על מענה לביקורות בגוגל.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                שמתי לב שיש לכם פרופיל עסקי בגוגל, ורציתי לשתף איך אפשר לטפל בביקורות בלי להשקיע בזה שעות כל שבוע.
              </Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground font-bold text-sm mb-4 m-0">איך זה עובד:</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">1. מחברים את הפרופיל העסקי</span> - תוך דקה, בלי הגדרות
                מסובכות.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">2. ביקורת חדשה נכנסת</span> - המערכת מזהה אותה מיד ומייצרת
                תגובה בעברית, בטון שמתאים לעסק שלכם.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-3">
                <span className="text-primary font-bold">3. אתם מאשרים ומפרסמים</span> - או נותנים למערכת לפרסם
                אוטומטית. הבחירה שלכם.
              </Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                עסקים שמגיבים לביקורות מקבלים יותר לקוחות חדשים. גוגל מעדיף עסקים פעילים בתוצאות החיפוש. הבעיה היא
                שלבעלי מסעדות אין זמן לשבת ולכתוב תגובות כל יום.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                Bottie פותר את זה. 5 תגובות בחודש בחינם, בלי כרטיס אשראי.
              </Text>
            </Section>

            <Section className="text-center mb-6">
              <Button
                href="https://bottie.ai/he"
                className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-lg"
              >
                לנסות בחינם
              </Button>
            </Section>

            <Section className="mb-4">
              <Text className="text-muted text-sm leading-relaxed m-0">
                יש שאלות? פשוט השיבו למייל הזה. אני קורא הכל.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-4">אלון</Text>
              <Text className="text-muted text-xs m-0">מייסד, Bottie.ai</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-4" />

            <Section className="mt-4">
              <Text className="text-muted text-xs text-center">
                קיבלתם את המייל הזה כי לעסק שלכם יש פרופיל עסקי בגוגל. לא מעוניינים? השיבו עם המילה &quot;הסר&quot;.
              </Text>
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
} as LeadOutreachEmailProps;
