import {
  Body,
  Container,
  Head,
  Html,
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
}

export function getZoeOutreachSubject(businessName: string): string {
  return `${businessName}, 4 דברים שראיתי באתר שלכם`;
}

const FONT_FAMILY = "Heebo, 'Segoe UI', Tahoma, sans-serif";
const CTA_URL = "https://zoedotan.com/exclusive-offer";
const ACCENT_PINK = "#FFB6C1";
const FOREGROUND = "#000000";
const BACKGROUND = "#FFFFFF";
const SECONDARY = "#E6E6FA";
const LIGHT_BG = "#F8F8FF";
const DARK_TEXT = "#333333";

export default function ZoeLeadOutreachEmail({ businessName }: ZoeLeadOutreachEmailProps) {
  return (
    <Html dir="rtl" lang="he">
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                background: BACKGROUND,
                foreground: FOREGROUND,
                "accent-pink": ACCENT_PINK,
                secondary: SECONDARY,
                "light-bg": LIGHT_BG,
                "dark-text": DARK_TEXT,
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
        </Head>
        <Preview>{`${businessName}, הצצתי באתר שלכם ורשמתי 4 נקודות שיכולות לשנות לכם את כמות הפניות`}</Preview>
        <Body
          className="bg-background my-auto mx-auto px-2"
          style={{ fontFamily: FONT_FAMILY, direction: "rtl", backgroundColor: BACKGROUND }}
        >
          <Container
            className="my-[32px] mx-auto max-w-[560px]"
            style={{ direction: "rtl", textAlign: "right", backgroundColor: BACKGROUND }}
          >
            <Section className="px-[36px] pt-[40px] pb-[8px] text-right">
              <Text
                className="m-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "3.5px",
                  textTransform: "uppercase",
                  color: FOREGROUND,
                }}
              >
                Zoe Dotan
              </Text>
              <Text
                className="m-0 mt-[4px]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 400,
                  fontSize: "10px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: DARK_TEXT,
                  opacity: 0.6,
                }}
              >
                Visual Communication
              </Text>
            </Section>

            <Section className="px-[36px] pt-[36px] pb-[8px] text-right">
              <Text
                className="m-0 mb-[14px]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: ACCENT_PINK,
                }}
              >
                {"// הצעה אישית"}
              </Text>
              <Text
                className="m-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "40px",
                  lineHeight: 1.05,
                  letterSpacing: "-1.2px",
                  color: FOREGROUND,
                }}
              >
                נעים מאוד,
                <br />
                <span style={{ color: ACCENT_PINK }}>{businessName}</span>.
              </Text>
              <div
                style={{
                  width: "64px",
                  height: "4px",
                  backgroundColor: ACCENT_PINK,
                  marginTop: "28px",
                  fontSize: "0",
                  lineHeight: "0",
                }}
              />
            </Section>

            <Section className="px-[36px] pt-[28px] pb-[32px] text-right">
              <Text
                className="m-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: DARK_TEXT,
                  textAlign: "right",
                }}
              >
                אני זואי, מעצבת גרפית המתמחה ביצירת נוכחות דיגיטלית ייחודית - כזו שלא נראית כמו עוד תבנית. לפני
                ששלחתי את המייל, בחנתי את האתר שלכם וזיהיתי מספר הזדמנויות שלדעתי גורמות לכם לפספס פניות פוטנציאליות.
              </Text>
            </Section>

            <Section className="px-[36px] pb-[40px]">
              <Section
                className="rounded-2xl text-right"
                style={{
                  direction: "rtl",
                  backgroundColor: LIGHT_BG,
                  border: `1px solid ${SECONDARY}`,
                  padding: "32px 28px",
                }}
              >
                <Text
                  className="m-0 mb-[10px]"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: DARK_TEXT,
                    opacity: 0.7,
                  }}
                >
                  למה שמתי לב
                </Text>
                <Text
                  className="m-0 mb-[20px]"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    fontSize: "26px",
                    lineHeight: 1.1,
                    letterSpacing: "-0.6px",
                    color: FOREGROUND,
                  }}
                >
                  ארבע <span style={{ color: ACCENT_PINK }}>הזדמנויות</span> שזיהיתי אצלכם.
                </Text>
                <Text
                  className="m-0 mb-[28px]"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: DARK_TEXT,
                  }}
                >
                  נקודות שבלי טיפול נכון עלולות להבריח לקוחות בשקט, אך ניתן לשפר אותן במהירות:
                </Text>

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      01
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      חוויה מותאמת לנייד
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      מעל 70% מהגולשים מגיעים דרך הנייד. אתר שלא מתוכנן קודם כל עבורם עלול לאבד אותם תוך שניות - עוד
                      לפני שהבינו מה יש לכם להציע.
                    </Text>
                  </Column>
                </Row>

                <Hr style={{ borderColor: SECONDARY, margin: "20px 0", width: "100%" }} />

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      02
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      שיעור המרה מה-CTA
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      כפתורי פעולה שאינם ברורים, ממוקמים לא נכון או חסרי היררכיה פוגעים בהמרות. שיפור קטן כאן יכול
                      להגדיל משמעותית את כמות הלידים - ללא צורך בהגדלת כמות הגולשים באתר.
                    </Text>
                  </Column>
                </Row>

                <Hr style={{ borderColor: SECONDARY, margin: "20px 0", width: "100%" }} />

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      03
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      תאימות ואופטימיזציה למנועי חיפוש
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      אם אתם לא מופיעים בעמוד הראשון במונחי החיפוש הרלוונטיים - המתחרים סוגרים את העסקאות במקומכם.
                      אופטימיזציה נכונה יכולה להחזיר לכם תנועה איכותית שכבר מחפשת אתכם.
                    </Text>
                  </Column>
                </Row>

                <Hr style={{ borderColor: SECONDARY, margin: "20px 0", width: "100%" }} />

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      04
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      הגדלת נוכחות במוצרי AI
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      יותר ויותר לקוחות פונים לכלים כמו ChatGPT ו-Gemini לקבלת המלצות. עסקים שאינם מותאמים לכך פשוט
                      לא מופיעים בתמונה - ומאבדים לקוחות מבלי לדעת שחיפשו אותם.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Section className="px-[36px] pb-[40px]">
              <Section
                className="rounded-2xl text-right"
                style={{
                  direction: "rtl",
                  backgroundColor: LIGHT_BG,
                  border: `1px solid ${SECONDARY}`,
                  padding: "32px 28px",
                }}
              >
                <Text
                  className="m-0 mb-[10px]"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: DARK_TEXT,
                    opacity: 0.7,
                  }}
                >
                  שירותים
                </Text>
                <Text
                  className="m-0 mb-[28px]"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    fontSize: "26px",
                    lineHeight: 1.1,
                    letterSpacing: "-0.6px",
                    color: FOREGROUND,
                  }}
                >
                  כך נוכל לעבוד <span style={{ color: ACCENT_PINK }}>יחד</span>.
                </Text>

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      01
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      קמפיינים ממומנים
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      טירגוט מדויק לקהל הנכון באינסטגרם, פייסבוק וטיקטוק - עם מודעות בולטות שמייצרות תוצאות.
                    </Text>
                  </Column>
                </Row>

                <Hr style={{ borderColor: SECONDARY, margin: "20px 0", width: "100%" }} />

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      02
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      אתרים ותשתיות דיגיטליות
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      תכנון ופיתוח אתרי אי-קומרס, אתרי תדמית ודפי נחיתה. שילוב בין עיצוב מוקפד לטכנולוגיה מתקדמת
                      ליצירת חוויית משתמש מהירה, נקייה ומשכנעת - בהתאמה מלאה לצרכים העסקיים שלכם.
                    </Text>
                  </Column>
                </Row>

                <Hr style={{ borderColor: SECONDARY, margin: "20px 0", width: "100%" }} />

                <Row>
                  <Column className="w-[64px] align-top" style={{ verticalAlign: "top" }}>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "26px",
                        letterSpacing: "-0.5px",
                        color: ACCENT_PINK,
                        lineHeight: 1,
                      }}
                    >
                      03
                    </Text>
                  </Column>
                  <Column>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: FOREGROUND,
                        marginBottom: "6px",
                      }}
                    >
                      מיתוג ואסטרטגיה
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: DARK_TEXT,
                      }}
                    >
                      בניית זהות ויזואלית שלמה - מלוגו ועד שפה עיצובית מובחנת ובולטת.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Section className="text-right" style={{ backgroundColor: FOREGROUND, padding: "44px 36px" }}>
              <Text
                className="m-0 mb-[14px]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: ACCENT_PINK,
                }}
              >
                {"// למה אני"}
              </Text>
              <Text
                className="m-0 mb-[18px]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "28px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.6px",
                  color: BACKGROUND,
                }}
              >
                עיצוב מדויק <span style={{ color: ACCENT_PINK }}>+</span> אסטרטגיה חכמה{" "}
                <span style={{ color: ACCENT_PINK }}>=</span> קפיצת מדרגה אמיתית.
              </Text>
              <Text
                className="m-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                אני מאמינה שהשילוב הזה יכול לקחת את{" "}
                <span style={{ fontWeight: 700, color: ACCENT_PINK }}>{businessName}</span> לשלב הבא - ואשמח להראות
                לכם בדיוק איך.
              </Text>
            </Section>

            <Section className="px-[36px] pt-[40px] pb-[16px] text-right">
              <Button
                href={CTA_URL}
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  backgroundColor: FOREGROUND,
                  color: BACKGROUND,
                  padding: "18px 36px",
                  fontSize: "14px",
                  textDecoration: "none",
                  borderRadius: "0",
                  display: "inline-block",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                להצעה הבלעדית &#8592;
              </Button>
            </Section>

            <Section
              className="px-[36px] pt-[32px] pb-[28px] text-right"
              style={{ borderTop: `1px solid ${SECONDARY}`, marginTop: "24px" }}
            >
              <Text className="m-0" style={{ fontFamily: FONT_FAMILY, fontSize: "14px", color: DARK_TEXT }}>
                המשך יום נפלא,
              </Text>
              <Text
                className="m-0 mt-[6px]"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                  fontSize: "26px",
                  letterSpacing: "-0.6px",
                  color: FOREGROUND,
                }}
              >
                זואי
              </Text>
            </Section>

            <Section className="px-[36px] pb-[32px] text-center">
              <Hr style={{ borderColor: SECONDARY, margin: "0 0 20px 0", width: "100%" }} />
              <Text
                className="m-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "10px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: DARK_TEXT,
                  opacity: 0.6,
                  lineHeight: 1.7,
                }}
              >
                קיבלתם את המייל הזה מכיוון שלעסק שלכם יש נוכחות דיגיטלית. אם אינכם מעוניינים, ניתן להשיב &quot;הסר&quot;.
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
} as ZoeLeadOutreachEmailProps;
