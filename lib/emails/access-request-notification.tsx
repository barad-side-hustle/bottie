import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import { EmailFont, EmailLogo, emailTailwindConfig } from "./theme";

interface AccessRequestNotificationEmailProps {
  requesterName: string;
  requesterEmail: string;
  locationName: string;
  message?: string;
  settingsUrl: string;
}

export default function AccessRequestNotificationEmail({
  requesterName,
  requesterEmail,
  locationName,
  message,
  settingsUrl,
}: AccessRequestNotificationEmailProps) {
  const previewText = `${requesterName} requested access to ${locationName}`;

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <EmailFont />
        </Head>
        <Preview>{previewText}</Preview>
        <Body className="bg-background font-sans text-foreground">
          <Container className="mx-auto max-w-lg px-4 py-8">
            <Section className="rounded-xl border border-solid border-border bg-card p-8 shadow-sm">
              <div className="mb-6">
                <EmailLogo align="left" />
              </div>
              <Text className="text-primary text-xs font-bold uppercase tracking-wider m-0 mb-2">Access Request</Text>
              <Heading className="mb-4 text-2xl font-bold text-foreground">
                New Access Request for {locationName}
              </Heading>
              <Text className="mb-2 text-base text-foreground">
                <strong>{requesterName}</strong> ({requesterEmail}) is requesting access to manage{" "}
                <strong>{locationName}</strong>.
              </Text>
              {message && (
                <Section className="my-4 rounded-md border border-solid border-border bg-surface p-4">
                  <Text className="text-sm text-foreground italic m-0">&quot;{message}&quot;</Text>
                </Section>
              )}
              <Text className="mb-6 text-sm text-muted">
                You can approve or reject this request from your location settings.
              </Text>
              <Button href={settingsUrl} className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white">
                Review Request
              </Button>
              <Hr className="my-6 border-border" />
              <Text className="text-xs text-subtle">This is an automated notification from Bottie.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

AccessRequestNotificationEmail.PreviewProps = {
  requesterName: "John Doe",
  requesterEmail: "example@gmail.com",
  locationName: "My Business",
  message: "I would like to help manage the reviews for this location.",
  settingsUrl: "https://example.com/settings",
} as AccessRequestNotificationEmailProps;
