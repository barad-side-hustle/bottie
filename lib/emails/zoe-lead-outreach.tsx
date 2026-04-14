import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Font,
  Hr,
  Button,
  Row,
  Column,
} from "@react-email/components";

interface ZoeLeadOutreachEmailProps {
  businessName: string;
  city: string;
}

export function getZoeOutreachSubject(businessName: string): string {
  return `נוכחות דיגיטלית שממירה — ${businessName}`;
}

const FONT_FAMILY = "Heebo, 'Segoe UI', Tahoma, sans-serif";
const FONT_PLAYFUL = "'Playpen Sans Hebrew', 'Segoe UI', Tahoma, sans-serif";

export default function ZoeLeadOutreachEmail({ businessName }: ZoeLeadOutreachEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bg: "#FFF5F0",
                coral: "#E8624A",
                "coral-light": "#F4A393",
                "coral-pale": "#FDDDD6",
                cream: "#FFF9F2",
                blush: "#F9E4DD",
                lavender: "#EDE3F5",
                "lavender-light": "#F5F0FA",
                sage: "#D4E4D2",
                "sage-dark": "#7BA377",
                brown: "#3D2B1F",
                "brown-light": "#5C4033",
                "brown-muted": "#8B7355",
                warm: "#6B4D3E",
                "warm-light": "#A08472",
              },
            },
          },
        }}
      >
        <Head>
          <Font
            fontFamily="Heebo"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyccg.ttf",
              format: "truetype",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Heebo"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Ebiuccg.ttf",
              format: "truetype",
            }}
            fontWeight={700}
            fontStyle="normal"
          />
          <Font
            fontFamily="Playpen Sans Hebrew"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/playpensanshebrew/v8/lJws-okuj29wT-AN6RvLx8QqjkKhL7eAjoL9jK7L4vstDnnp55C6.ttf",
              format: "truetype",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Playpen Sans Hebrew"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/playpensanshebrew/v8/lJws-okuj29wT-AN6RvLx8QqjkKhL7eAjoL9jK7L4vstDnkO4JC6.ttf",
              format: "truetype",
            }}
            fontWeight={700}
            fontStyle="normal"
          />
        </Head>
        <Preview>{`${businessName} — נוכחות דיגיטלית שממירה קליקים ללקוחות`}</Preview>
        <Body className="bg-bg my-auto mx-auto px-2" style={{ fontFamily: FONT_FAMILY }}>
          <Container className="my-[32px] mx-auto max-w-[560px]">

            <Section className="bg-cream rounded-t-3xl pt-8 pb-4 text-center">
              <Text
                className="text-coral text-[28px] m-0 tracking-[1px]"
                style={{ fontFamily: FONT_FAMILY, fontWeight: 700 }}
              >
                ZOE DOTAN
              </Text>
              <Text className="text-warm-light text-[11px] tracking-[1.5px] m-0 mt-1">VISUAL COMMUNICATION</Text>
            </Section>

            <Section className="bg-coral py-8 px-[40px] text-center">
              <Text
                className="text-cream text-[24px] leading-snug m-0"
                style={{ fontFamily: FONT_FAMILY, fontWeight: 700 }}
              >
                נעים מאוד,
                <br />
                {businessName}
              </Text>
            </Section>

            <Section className="bg-cream px-[36px] pt-[32px] pb-0">
              <Text className="text-brown text-[15px] leading-[1.8] m-0 mb-6" style={{ fontFamily: FONT_FAMILY }}>
                אני זואי, מעצבת גרפית שמתמחה בבניית נוכחות דיגיטלית שלא נראית כמו &quot;עוד תבנית&quot;. אני עוזרת
                לעסקים לדייק את הנראות שלהם ולהביא לקוחות איכותיים באמת.
              </Text>
            </Section>

            <Section className="bg-cream px-[36px] pb-[28px]">
              <Section className="bg-lavender-light rounded-2xl px-[24px] py-[24px]">
                <Text className="text-brown text-[16px] m-0 mb-5" style={{ fontFamily: FONT_PLAYFUL, fontWeight: 700 }}>
                  מה אנחנו יכולים לעשות יחד?
                </Text>

                <Row className="mb-[14px]">
                  <Column className="w-[40px] align-top">
                    <Text
                      className="text-coral text-[13px] m-0 rounded-full bg-coral-pale text-center leading-[28px] w-[28px] h-[28px]"
                      style={{ fontWeight: 700 }}
                    >
                      01
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="text-brown text-[14px] m-0 mb-[2px]"
                      style={{ fontFamily: FONT_PLAYFUL, fontWeight: 700 }}
                    >
                      קמפיינים ממומנים
                    </Text>
                    <Text className="text-brown-light text-[13px] leading-[1.6] m-0 opacity-80">
                      טירגוט מדויק לקהל הנכון באינסטגרם, פייסבוק וטיקטוק. מודעות שאי אפשר להתעלם מהן.
                    </Text>
                  </Column>
                </Row>

                <Hr className="border-lavender mx-0 w-full my-[12px]" />

                <Row className="mb-[14px]">
                  <Column className="w-[40px] align-top">
                    <Text
                      className="text-coral text-[13px] m-0 rounded-full bg-coral-pale text-center leading-[28px] w-[28px] h-[28px]"
                      style={{ fontWeight: 700 }}
                    >
                      02
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="text-brown text-[14px] m-0 mb-[2px]"
                      style={{ fontFamily: FONT_PLAYFUL, fontWeight: 700 }}
                    >
                      אתרים ודפי נחיתה
                    </Text>
                    <Text className="text-brown-light text-[13px] leading-[1.6] m-0 opacity-80">
                      בנייה ב-Framer ו-Wix. עיצוב נקי וחווית משתמש שממירה גולשים ללקוחות.
                    </Text>
                  </Column>
                </Row>

                <Hr className="border-lavender mx-0 w-full my-[12px]" />

                <Row>
                  <Column className="w-[40px] align-top">
                    <Text
                      className="text-coral text-[13px] m-0 rounded-full bg-coral-pale text-center leading-[28px] w-[28px] h-[28px]"
                      style={{ fontWeight: 700 }}
                    >
                      03
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="text-brown text-[14px] m-0 mb-[2px]"
                      style={{ fontFamily: FONT_PLAYFUL, fontWeight: 700 }}
                    >
                      מיתוג ואסטרטגיה
                    </Text>
                    <Text className="text-brown-light text-[13px] leading-[1.6] m-0 opacity-80">
                      בניית זהות ויזואלית שלמה — מלוגו ועד שפה עיצובית שאי אפשר להתעלם ממנה.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Section className="bg-cream px-[36px] pb-[36px]">
              <Text className="text-brown text-[15px] leading-[1.8] m-0 mb-7" style={{ fontFamily: FONT_FAMILY }}>
                אני מאמינה ששילוב של עיצוב נכון ואסטרטגיה חכמה יכול להקפיץ את{" "}
                <span style={{ fontWeight: 700, color: "#E8624A" }}>{businessName}</span> לשלב הבא.
              </Text>

              <Section className="text-center">
                <Button
                  href="https://www.zoedotan.com"
                  className="bg-brown text-cream rounded-full px-[36px] py-[14px] text-[15px] no-underline"
                  style={{ fontFamily: FONT_FAMILY, fontWeight: 700 }}
                >
                  בואו נדבר &#8592;
                </Button>
              </Section>
            </Section>

            <Section className="bg-blush px-[36px] py-[28px]">
              <Text className="text-brown text-[15px] m-0" style={{ fontFamily: FONT_FAMILY }}>
                המשך יום מהמם,
              </Text>
              <Text className="text-coral text-[17px] m-0 mt-1" style={{ fontFamily: FONT_FAMILY, fontWeight: 700 }}>
                זואי
              </Text>
            </Section>

            <Section className="bg-cream rounded-b-3xl px-[36px] py-5 text-center">
              <Link
                href="https://www.zoedotan.com"
                className="text-warm text-xs no-underline"
                style={{ fontWeight: 700, fontFamily: FONT_FAMILY }}
              >
                www.zoedotan.com
              </Link>

              <Hr className="border-blush mx-0 w-full my-3" />

              <Text className="text-warm-light text-[10px] m-0 leading-relaxed">
                קיבלתם את המייל הזה כי לעסק שלכם יש נוכחות דיגיטלית. לא מעוניינים? השיבו &quot;הסר&quot;.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ZoeLeadOutreachEmail.PreviewProps = {
  businessName: "סטודיו לעיצוב",
  city: "תל אביב",
} as ZoeLeadOutreachEmailProps;
