import {
  Body,
  Button,
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

interface VerifyEmailProps {
  userName: string;
  url: string;
}

export default function VerifyEmailTemplate({
  userName = "User",
  url = "https://bottie.ai/api/auth/verify-email?token=example",
}: VerifyEmailProps) {
  const previewText = "Verify your email address for Bottie.ai";

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
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Email Verification</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">Verify Your Email</Heading>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground text-sm leading-relaxed m-0 mb-4">
                Hi {userName}, click the button below to verify your email address and activate your account.
              </Text>
              <Section className="my-6 text-center">
                <Button href={url} className="bg-primary text-white rounded px-6 py-3 text-sm font-bold no-underline">
                  Verify Email
                </Button>
              </Section>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">
                If you didn&apos;t create an account, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerifyEmailTemplate.PreviewProps = {
  userName: "John",
  url: "https://bottie.ai/api/auth/verify-email?token=example",
} as VerifyEmailProps;
