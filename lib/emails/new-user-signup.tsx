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
  Button,
} from "@react-email/components";
import { EmailFont, EmailLogo, emailTailwindConfig } from "./theme";

interface NewUserSignupEmailProps {
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
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(signupTimestamp);

  const previewText = `New user signup: ${userName}`;

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

            <Section className="mb-8 text-center">
              <Heading className="text-foreground text-2xl font-bold p-0 m-0 leading-tight">New User Signup</Heading>
              <Text className="text-muted text-sm m-0 mt-2">A new user has joined the platform</Text>
            </Section>

            <Hr className="border-border mx-0 w-full" />

            <Section className="my-6 p-6 bg-surface rounded-xl border border-border border-solid">
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">Name</Text>
                <Text className="text-foreground text-lg font-bold m-0">{userName}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">Email</Text>
                <Text className="text-primary text-base m-0 font-medium no-underline">{userEmail}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">User ID</Text>
                <Text className="text-foreground text-sm font-mono m-0 bg-card border border-solid border-border p-1 rounded inline-block">
                  {userId}
                </Text>
              </div>
              <div className="text-center sm:text-left">
                <Text className="text-subtle text-xs font-bold uppercase tracking-wider m-0 mb-1">Signed Up At</Text>
                <Text className="text-foreground text-sm m-0">{formattedDate}</Text>
              </div>
            </Section>

            <Section className="text-center mt-8">
              <Button
                href={dashboardUrl}
                className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-sm"
              >
                View User Dashboard
              </Button>
            </Section>

            <Hr className="border-border mx-0 w-full mt-8" />

            <Section className="mt-6">
              <Text className="text-subtle text-xs text-center">Bottie.ai System Notification</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
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
