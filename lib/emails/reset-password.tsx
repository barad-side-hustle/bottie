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
  Hr,
} from "@react-email/components";
import { EmailFont, EmailLogo, emailTailwindConfig } from "./theme";

interface ResetPasswordEmailProps {
  userName: string;
  url: string;
}

export default function ResetPasswordEmailTemplate({
  userName = "User",
  url = "https://bottie.ai/reset-password?token=example",
}: ResetPasswordEmailProps) {
  const previewText = "Reset your Bottie.ai password";

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <EmailFont />
        </Head>
        <Preview>{previewText}</Preview>
        <Body className="bg-background my-auto mx-auto font-sans px-2 text-foreground">
          <Container className="border border-solid border-border rounded-xl shadow-sm my-[40px] mx-auto p-[32px] max-w-[600px] bg-card">
            <Section className="mt-2 mb-6">
              <EmailLogo />
            </Section>

            <Section className="mb-6 text-center">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Password Reset</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">Reset Your Password</Heading>
            </Section>

            <Hr className="border-border mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                Hi {userName}, we received a request to reset your password. Click the button below to choose a new one.
              </Text>
              <Section className="my-6 text-center">
                <Button
                  href={url}
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline"
                >
                  Reset Password
                </Button>
              </Section>
            </Section>

            <Hr className="border-border mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-subtle text-xs text-center">
                If you didn&apos;t request this, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordEmailTemplate.PreviewProps = {
  userName: "John",
  url: "https://bottie.ai/reset-password?token=example",
} as ResetPasswordEmailProps;
