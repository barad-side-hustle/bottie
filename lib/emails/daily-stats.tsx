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
} from "@react-email/components";

interface DailyStatsEmailProps {
  newUsers: Array<{ name: string; email: string }>;
  newGoogleAccounts: Array<{ email: string; accountName: string }>;
  reviewCount: number;
}

export default function DailyStatsEmail({ newUsers, newGoogleAccounts, reviewCount }: DailyStatsEmailProps) {
  const previewText = `Daily Stats: ${newUsers.length} users, ${newGoogleAccounts.length} accounts, ${reviewCount} reviews`;

  return (
    <Html>
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
                success: "#22c55e",
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
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">Daily Stats</Heading>
              <Text className="text-muted text-sm m-0 mt-2">{new Date().toISOString().split("T")[0]}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary m-0 mb-3">
                New Users ({newUsers.length})
              </Text>
              {newUsers.length === 0 ? (
                <Text className="text-muted text-sm m-0">None</Text>
              ) : (
                <div className="bg-background border border-solid border-border rounded-xl p-4">
                  {newUsers.map((u, i) => (
                    <Text key={i} className="text-muted text-sm leading-relaxed m-0 mb-1">
                      <span className="text-foreground font-bold">{u.name}</span> ({u.email})
                    </Text>
                  ))}
                </div>
              )}
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary m-0 mb-3">
                New Google Accounts ({newGoogleAccounts.length})
              </Text>
              {newGoogleAccounts.length === 0 ? (
                <Text className="text-muted text-sm m-0">None</Text>
              ) : (
                <div className="bg-background border border-solid border-border rounded-xl p-4">
                  {newGoogleAccounts.map((a, i) => (
                    <Text key={i} className="text-muted text-sm leading-relaxed m-0 mb-1">
                      <span className="text-foreground font-bold">{a.email}</span> — {a.accountName}
                    </Text>
                  ))}
                </div>
              )}
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary m-0 mb-3">
                Reviews Received
              </Text>
              <Text className="text-success text-3xl font-bold m-0">{reviewCount}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center m-0">Bottie.ai Daily Stats</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DailyStatsEmail.PreviewProps = {
  newUsers: [
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
  ],
  newGoogleAccounts: [{ email: "biz@example.com", accountName: "Example Business" }],
  reviewCount: 42,
} as DailyStatsEmailProps;
