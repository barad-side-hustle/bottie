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
  Font,
} from "@react-email/components";

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
        <Body className="bg-background font-sans">
          <Container className="mx-auto max-w-lg px-4 py-8">
            <Section className="rounded-lg border border-border bg-card p-8">
              <Heading className="mb-4 text-2xl font-bold text-foreground">
                New Access Request for {locationName}
              </Heading>
              <Text className="mb-2 text-base text-foreground">
                <strong>{requesterName}</strong> ({requesterEmail}) is requesting access to manage{" "}
                <strong>{locationName}</strong>.
              </Text>
              {message && (
                <Section className="my-4 rounded-md border border-border bg-background/50 p-4">
                  <Text className="text-sm text-foreground italic">&quot;{message}&quot;</Text>
                </Section>
              )}
              <Text className="mb-6 text-sm text-muted">
                You can approve or reject this request from your location settings.
              </Text>
              <Button href={settingsUrl} className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white">
                Review Request
              </Button>
              <Hr className="my-6 border-border" />
              <Text className="text-xs text-muted">This is an automated notification from Bottie.</Text>
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
