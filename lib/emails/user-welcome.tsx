import { Body, Container, Head, Heading, Hr, Html, Section, Text } from "@react-email/components";

export interface UserWelcomeEmailProps {
  userName: string;
  userEmail: string;
}

export default function UserWelcomeEmail({ userName }: UserWelcomeEmailProps) {
  const primary = "#2A5E77";
  const bgOuter = "#F4F3EE";
  const bgContent = "#FFFFFF";
  const textDark = "#141414";
  const borderSoft = "#E2E2E0";
  const highlight = "#DFA45C";

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: bgOuter,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <Container
          style={{
            margin: "40px auto",
            maxWidth: "600px",
            backgroundColor: bgContent,
            borderRadius: "12px",
            border: `1px solid ${borderSoft}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Section
            style={{
              backgroundColor: primary,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <Heading
              style={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              Welcome to Bottie.ai
            </Heading>
          </Section>

          <Section
            style={{
              padding: "32px 24px",
              color: textDark,
            }}
          >
            <Text
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                lineHeight: 1.4,
              }}
            >
              Hi {userName},
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "0 0 16px 0",
              }}
            >
              I&apos;m Alon, the founder of Bottie.ai. I noticed you recently signed up, and I wanted to personally
              reach out.
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "0 0 16px 0",
                fontWeight: 600,
                color: primary,
              }}
            >
              As one of our first users, your experience means the world to us.
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "0 0 24px 0",
              }}
            >
              I noticed you haven&apos;t fully completed the onboarding yet, and I&apos;d love to help you get set up so
              you can start saving time on your Google Reviews immediately.
            </Text>

            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "24px",
              }}
            >
              <Heading
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: primary,
                  margin: "0 0 12px 0",
                }}
              >
                What Bottie.ai does for you right now:
              </Heading>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Our system connects to your Google Business Profile to automatically generate professional, personalized
                responses to every review. Whether it&apos;s a 5-star compliment or critical feedback, our AI ensures
                your brand voice is maintained without you typing a single word.
              </Text>
            </Section>

            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "24px",
              }}
            >
              <Heading
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: primary,
                  margin: "0 0 12px 0",
                }}
              >
                Actionable Insights
              </Heading>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Beyond just replying, Bottie.ai provides Actionable Insights. The system analyzes your reviews to
                highlight trends - telling you exactly what your customers love and identifying specific areas for
                improvement, so you can make data-driven decisions instantly.
              </Text>
            </Section>

            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "24px",
              }}
            >
              <Heading
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: primary,
                  margin: "0 0 12px 0",
                }}
              >
                Let&apos;s have a quick chat?
              </Heading>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Since you are our pioneer user, I&apos;d love to jump on a brief 10-15 minute call to walk you through
                the setup personally and hear your thoughts.
              </Text>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  margin: "12px 0 0 0",
                }}
              >
                <strong>Are you free for a quick chat later this week?</strong> Just reply to this email and let me
                know.
              </Text>
            </Section>

            <Section
              style={{
                backgroundColor: highlight,
                borderRadius: "8px",
                padding: "24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <Heading
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  margin: "0 0 12px 0",
                }}
              >
                A Gift for You
              </Heading>
              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "#FFFFFF",
                  margin: "0 0 16px 0",
                }}
              >
                To say thank you for joining us at the very beginning, I&apos;ve created a special coupon just for you:
              </Text>
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "inline-block",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 4px 0",
                  }}
                >
                  Use code:
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: primary,
                    margin: 0,
                    letterSpacing: "2px",
                  }}
                >
                  FREE3M
                </Text>
              </div>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#FFFFFF",
                  margin: "16px 0 0 0",
                }}
              >
                Get 3 months of full access completely free
              </Text>
            </Section>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "24px 0 0 0",
              }}
            >
              I can&apos;t wait to help you transform how you handle customer reviews!
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "24px 0 0 0",
              }}
            >
              Best regards,
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                fontWeight: 600,
                margin: "8px 0 0 0",
              }}
            >
              Alon
            </Text>
            <Text
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#6b7280",
                margin: "4px 0 0 0",
              }}
            >
              Founder, Bottie.ai
            </Text>
          </Section>

          <Section style={{ padding: "0 24px 24px 24px" }}>
            <Hr style={{ borderColor: borderSoft, margin: "0 0 16px 0" }} />
            <Text
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#6b7280",
                textAlign: "center",
                margin: 0,
              }}
            >
              You&apos;re receiving this email because you signed up for Bottie.ai
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

UserWelcomeEmail.PreviewProps = {
  userName: "John",
  userEmail: "john@example.com",
} as UserWelcomeEmailProps;
