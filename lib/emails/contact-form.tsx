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

interface ContactFormEmailProps {
  senderEmail: string;
  subject: string;
  message: string;
}

export default function ContactFormEmail({ senderEmail, subject, message }: ContactFormEmailProps) {
  const previewText = `Contact form: ${subject} from ${senderEmail}`;

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
        <Preview>{previewText}</Preview>
        <Body className="bg-background my-auto mx-auto font-sans px-2 text-foreground">
          <Container className="border border-solid border-border rounded-lg my-[40px] mx-auto p-[20px] max-w-[600px] bg-card">
            <Section className="mt-8 mb-8 text-center">
              <Heading className="text-foreground text-2xl font-bold p-0 m-0 leading-tight">
                New Contact Form Submission
              </Heading>
              <Text className="text-muted text-sm m-0 mt-2">{subject}</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6 p-6 bg-background rounded-xl border border-border border-solid">
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">From</Text>
                <Text className="text-primary text-base m-0 font-medium no-underline">{senderEmail}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">Subject</Text>
                <Text className="text-foreground text-lg font-bold m-0">{subject}</Text>
              </div>
              <div className="text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">Message</Text>
                <Text className="text-foreground text-sm m-0 whitespace-pre-wrap">{message}</Text>
              </div>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-8" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">
                Bottie.ai Contact Form — Reply directly to respond to {senderEmail}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ContactFormEmail.PreviewProps = {
  senderEmail: "visitor@example.com",
  subject: "General Inquiry",
  message: "Hi, I'm interested in learning more about Bottie.ai and how it can help my business manage Google reviews.",
} as ContactFormEmailProps;
