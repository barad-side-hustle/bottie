import { Body, Container, Head, Html, Preview, Section, Text, Tailwind, Font, Hr } from "@react-email/components";

interface CronSummaryEmailProps {
  cronName: string;
  status: "success" | "error";
  lines: string[];
}

export function CronSummaryEmail({ cronName, status, lines }: CronSummaryEmailProps) {
  const isError = status === "error";
  const previewText = `${cronName}: ${isError ? "Failed" : "Completed"}`;

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
                error: "#ef4444",
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
        </Head>
        <Preview>{previewText}</Preview>
        <Body className="bg-background my-auto mx-auto font-sans px-2 text-foreground">
          <Container className="border border-solid border-border rounded-lg my-[40px] mx-auto p-[20px] max-w-[500px] bg-card">
            <Section className="mb-4">
              <Text
                className={`text-xs font-bold uppercase tracking-wider m-0 mb-1 ${isError ? "text-error" : "text-success"}`}
              >
                {isError ? "Failed" : "Completed"}
              </Text>
              <Text className="text-foreground text-lg font-bold m-0">{cronName}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-4">
              {lines.map((line, i) => (
                <Text key={i} className="text-muted text-sm leading-relaxed m-0 mb-1">
                  {line}
                </Text>
              ))}
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="mt-4">
              <Text className="text-muted text-xs">Bottie.ai Cron - {new Date().toISOString().split("T")[0]}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

CronSummaryEmail.PreviewProps = {
  cronName: "Find Leads",
  status: "success",
  lines: [
    "Cities: Tel Aviv, Jerusalem, Haifa",
    "Places found: 180",
    "New leads: 145",
    "Emails found: 42",
    "Skipped (no email): 103",
    "Duration: 168.2s",
  ],
} as CronSummaryEmailProps;
