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
import { EmailFont, EmailLogo, emailColors, emailTailwindConfig } from "./theme";

export interface ReviewNotificationEmailProps {
  title: string;
  greeting: string;
  body: string;
  businessName: string;
  noReviewText: string;
  aiReplyHeader: string;
  statusText: string;
  viewReviewButton: string;
  footer: string;

  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply?: string;
  status: "pending" | "posted" | "failed";
  reviewPageUrl: string;
}

export default function ReviewNotificationEmail({
  title,
  greeting,
  body,
  businessName,
  noReviewText,
  aiReplyHeader,
  statusText,
  viewReviewButton,
  footer,
  reviewerName,
  rating,
  reviewText,
  aiReply,
  status,
  reviewPageUrl,
}: ReviewNotificationEmailProps) {
  const previewText = `${reviewerName} left a ${rating}-star review`;

  const stars = Array.from({ length: 5 }).map((_, i) => (
    <span key={i} style={{ color: i < rating ? emailColors.star : emailColors.starEmpty, fontSize: "16px" }}>
      ★
    </span>
  ));

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

            <Section className="mb-2">
              <Heading className="text-foreground text-xl font-bold p-0 m-0">{title}</Heading>
              <Text className="text-foreground text-base font-bold m-0 mt-4 mb-1">{greeting}</Text>
              <Text className="text-muted text-sm m-0">
                {body} <span className="text-foreground font-semibold">{businessName}</span>
              </Text>
            </Section>

            <Section className="mt-5 mb-6">
              <div className="bg-surface border border-solid border-border rounded-xl p-5">
                <Text className="text-foreground text-base font-bold m-0">{reviewerName}</Text>
                <div className="mt-1 mb-3 leading-none" style={{ letterSpacing: "1px" }}>
                  {stars}
                </div>
                <Text className="text-muted text-sm leading-relaxed m-0">
                  &ldquo;{reviewText || noReviewText}&rdquo;
                </Text>
              </div>
            </Section>

            {aiReply ? (
              <Section className="mb-6">
                <div className="bg-card border border-solid border-border rounded-xl p-5">
                  <table
                    role="presentation"
                    cellPadding="0"
                    cellSpacing="0"
                    width="100%"
                    style={{ marginBottom: "12px" }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: "middle" }}>
                          <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
                            {aiReplyHeader}
                          </span>
                        </td>
                        <td style={{ verticalAlign: "middle", textAlign: "right" }}>
                          <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border border-solid ${
                              status === "posted"
                                ? "text-success bg-success-tint border-success"
                                : "text-accent-text bg-accent-tint border-primary"
                            }`}
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="ps-3" style={{ borderInlineStart: `2px solid ${emailColors.primary}` }}>
                    <Text className="text-foreground text-sm leading-relaxed m-0 whitespace-pre-wrap">{aiReply}</Text>
                  </div>
                </div>
              </Section>
            ) : (
              <Section className="mb-6">
                <div className="bg-destructive-tint border border-solid border-destructive rounded-xl p-5">
                  <Text className="text-destructive text-sm font-bold m-0 mb-1">{statusText}</Text>
                  <Text className="text-muted text-sm m-0">Please visit the dashboard to reply manually.</Text>
                </div>
              </Section>
            )}

            <Section className="text-center mb-2">
              <Button
                href={reviewPageUrl}
                className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline"
              >
                {viewReviewButton}
              </Button>
            </Section>

            <Hr className="border-border mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-subtle text-xs text-center m-0">{footer}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ReviewNotificationEmail.PreviewProps = {
  title: "New Review Received",
  greeting: "Hi Alon,",
  body: "You received a new review for",
  businessName: "Example Business",
  noReviewText: "No review text provided",
  aiReplyHeader: "AI Generated Reply",
  statusText: "Pending Approval",
  viewReviewButton: "View Review",
  footer: "You're receiving this email because you enabled notifications for new reviews",
  reviewerName: "John Doe",
  rating: 5,
  reviewText: "Excellent! Highly recommended",
  aiReply: "Thank you so much for the great feedback!",
  status: "pending",
  reviewPageUrl: "https://bottie.ai/dashboard/locations/456/reviews/789",
} as ReviewNotificationEmailProps;
