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

interface LocationInvitationEmailProps {
  inviterName: string;
  locationName: string;
  acceptUrl: string;
}

export default function LocationInvitationEmail({
  inviterName,
  locationName,
  acceptUrl,
}: LocationInvitationEmailProps) {
  const previewText = `${inviterName} invited you to manage ${locationName} on Bottie`;

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
                You&apos;re invited to manage {locationName}
              </Heading>
              <Text className="mb-4 text-base text-foreground">
                {inviterName} has invited you to join as an admin for <strong>{locationName}</strong> on Bottie.
              </Text>
              <Text className="mb-6 text-sm text-muted">
                As an admin, you&apos;ll be able to view and respond to reviews, manage AI settings, and access
                insights.
              </Text>
              <Button href={acceptUrl} className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white">
                Accept Invitation
              </Button>
              <Hr className="my-6 border-border" />
              <Text className="text-xs text-muted">
                This invitation expires in 7 days. If you didn&apos;t expect this email, you can safely ignore it.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

LocationInvitationEmail.PreviewProps = {
  inviterName: "John Doe",
  locationName: "My Business",
  acceptUrl: "https://example.com/accept",
} as LocationInvitationEmailProps;
