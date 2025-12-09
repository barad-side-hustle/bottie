import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text } from "@react-email/components";

export interface NewUserSignupEmailProps {
  userName: string;
  userEmail: string;
  userId: string;
  signupTimestamp: Date;
  dashboardUrl: string;
}

export default function NewUserSignupEmail({
  userName,
  userEmail,
  userId,
  signupTimestamp,
  dashboardUrl,
}: NewUserSignupEmailProps) {
  const primary = "#2A5E77";
  const bgOuter = "#F4F3EE";
  const bgContent = "#FFFFFF";
  const textDark = "#141414";
  const borderSoft = "#E2E2E0";

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(signupTimestamp);

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
              New User Signup
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
              Hi Alon,
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "0 0 24px 0",
              }}
            >
              A new user has just signed up for Bottie.ai!
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      Name:
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "16px",
                        color: textDark,
                      }}
                    >
                      {userName}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      Email:
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "16px",
                        color: textDark,
                      }}
                    >
                      {userEmail}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      User ID:
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontFamily: "monospace",
                      }}
                    >
                      {userId}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      Signup Time:
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: textDark,
                      }}
                    >
                      {formattedDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={{ textAlign: "center", paddingTop: "8px" }}>
              <Button
                href={dashboardUrl}
                style={{
                  backgroundColor: primary,
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "14px 48px",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                View User in Dashboard
              </Button>
            </Section>
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
              This is an automated notification from Bottie.ai
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

NewUserSignupEmail.PreviewProps = {
  userName: "John Doe",
  userEmail: "john@example.com",
  userId: "123e4567-e89b-12d3-a456-426614174000",
  signupTimestamp: new Date(),
  dashboardUrl: "https://bottie.ai/dashboard",
} as NewUserSignupEmailProps;
