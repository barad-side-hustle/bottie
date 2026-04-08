import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
  const previewText = `${businessName} - ניהול ביקורות גוגל אוטומטי`;

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
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">שלום {businessName} 👋</Heading>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                שמי אלון, והקמתי את Bottie.ai — מערכת שעוזרת לעסקים כמו שלכם ב{city} לנהל ביקורות גוגל בצורה אוטומטית
                וחכמה.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                אני פונה אליכם כי שמתי לב שיש לכם פרופיל עסקי בגוגל, ואני מאמין שנוכל לעזור לכם לחסוך זמן ולשפר את
                הנוכחות הדיגיטלית שלכם.
              </Text>

              <Section className="mb-8">
                <Text className="text-foreground font-bold text-base mb-4 m-0">מה Bottie.ai עושה בשבילכם:</Text>

                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-4">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    🤖 תגובות אוטומטיות לביקורות
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    המערכת מזהה ביקורות חדשות ומייצרת תגובה מותאמת אישית בעברית — מקצועית, אישית, ובטון שמתאים לעסק
                    שלכם.
                  </Text>
                </div>

                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-4">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    📊 תובנות חכמות
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    קבלו ניתוח מיידי של הביקורות שלכם — מה עובד, מה דורש שיפור, ואיפה ההזדמנויות.
                  </Text>
                </div>

                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-6">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    ⏰ חיסכון בזמן
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    במקום לבזבז שעות על מענה לביקורות — הכל קורה אוטומטית תוך דקות.
                  </Text>
                </div>
              </Section>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mb-6">
                <Heading as="h3" className="text-foreground font-bold m-0 mb-2 text-lg">
                  נסו בחינם — בלי התחייבות
                </Heading>
                <Text className="text-muted text-sm leading-relaxed m-0 mb-6 max-w-[400px] mx-auto">
                  5 תגובות חינם בחודש. חיבור פשוט לפרופיל הגוגל שלכם תוך דקה.
                </Text>
                <Button
                  href="https://bottie.ai"
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-lg"
                >
                  התחילו עכשיו בחינם
                </Button>
              </div>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-6">
                אשמח לשמוע מכם אם יש שאלות — פשוט השיבו למייל הזה.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-6">בברכה,</Text>

              <div className="mt-2">
                <Text className="text-foreground text-sm font-bold m-0">אלון</Text>
                <Text className="text-muted text-xs m-0">מייסד, Bottie.ai</Text>
              </div>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">
                קיבלתם את המייל הזה כי לעסק שלכם יש פרופיל עסקי בגוגל. אם אינכם מעוניינים לקבל הודעות נוספות, השיבו
                למייל זה עם המילה &quot;הסר&quot;.
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
