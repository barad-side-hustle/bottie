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
  Hr,
} from "@react-email/components";
import { EmailFont, emailTailwindConfig } from "./theme";

interface ContactFormEmailProps {
  senderEmail: string;
  subject: string;
  message: string;
}

export default function ContactFormEmail({ senderEmail, subject, message }: ContactFormEmailProps) {
  const previewText = `Contact form: ${subject} from ${senderEmail}`;

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <EmailFont />
        </Head>
        <Preview>{previewText}</Preview>
        <Body className="bg-background my-auto mx-auto font-sans px-2 text-foreground">
          <Container className="border border-solid border-border rounded-xl shadow-sm my-[40px] mx-auto p-[32px] max-w-[600px] bg-card">
            <Section className="mt-2 mb-8 text-center">
              <Heading className="text-foreground text-2xl font-bold p-0 m-0 leading-tight">
                New Contact Form Submission
              </Heading>
              <Text className="text-muted text-sm m-0 mt-2">{subject}</Text>
            </Section>

            <Hr className="border-border mx-0 w-full" />

            <Section className="my-6 p-6 bg-surface rounded-xl border border-border border-solid">
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">From</Text>
                <Text className="text-primary text-base m-0 font-medium no-underline">{senderEmail}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">Subject</Text>
                <Text className="text-foreground text-lg font-bold m-0">{subject}</Text>
              </div>
              <div className="text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">Message</Text>
                <Text className="text-foreground text-sm m-0 whitespace-pre-wrap">{message}</Text>
              </div>
            </Section>

            <Hr className="border-border mx-0 w-full mt-8" />

            <Section className="mt-6">
              <Text className="text-subtle text-xs text-center">
                Bottie.ai Contact Form -Reply directly to respond to {senderEmail}
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
