import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text } from "@react-email/components";

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
  aiReply: string;
  status: "pending" | "posted";
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
  const dir = "ltr";
  const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const primary = "#2A5E77";
  const bgOuter = "#F4F3EE";
  const bgContent = "#FFFFFF";
  const textDark = "#141414";
  const starColor = "#DFA45C";
  const borderSoft = "#E2E2E0";

  const statusColor = status === "pending" ? primary : "#10b981";

  const stars = Array.from({ length: 5 }).map((_, i) => (
    <span
      key={i}
      style={{
        color: i < rating ? starColor : "#d1d5db",
        fontSize: "22px",
        marginInlineEnd: "2px",
      }}
    >
      ★
    </span>
  ));

  return (
    <Html lang="en" dir={dir}>
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: bgOuter,
          fontFamily,
        }}
      >
        <Container
          style={{
            margin: "40px auto",
            maxWidth: "600px",
            backgroundColor: bgContent,
            borderRadius: "12px",
            border: `1px solid ${borderSoft}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Section
            style={{
              backgroundColor: primary,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <Heading
              style={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {title}
            </Heading>
          </Section>

          <Section
            style={{
              padding: "32px 24px",
              color: textDark,
            }}
          >
            <Text
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                lineHeight: 1.4,
              }}
            >
              {greeting}
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                margin: "0 0 24px 0",
              }}
            >
              {body} <strong style={{ fontWeight: 600 }}>{businessName}</strong>
            </Text>

            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: primary,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {reviewerName}
                </Text>

                <div
                  style={{
                    direction: "ltr",
                    whiteSpace: "nowrap",
                    fontSize: 0,
                  }}
                >
                  {stars}
                </div>
              </div>

              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  margin: 0,
                  color: reviewText ? textDark : "#999",
                  fontStyle: reviewText ? "normal" : "italic",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {reviewText || noReviewText}
              </Text>
            </Section>

            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: `1px solid ${borderSoft}`,
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: primary,
                    margin: 0,
                    letterSpacing: "0.2px",
                  }}
                >
                  {aiReplyHeader}
                </Text>

                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    backgroundColor: statusColor,
                  }}
                >
                  {statusText}
                </span>
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "6px",
                  border: `1px solid ${borderSoft}`,
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: primary,
                  whiteSpace: "pre-wrap",
                }}
              >
                {aiReply}
              </div>
            </Section>

            <Section style={{ textAlign: "center", paddingTop: "8px" }}>
              <Button
                href={reviewPageUrl}
                style={{
                  backgroundColor: primary,
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "14px 48px",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {viewReviewButton}
              </Button>
            </Section>
          </Section>

          <Section style={{ padding: "0 24px 24px 24px" }}>
            <Hr style={{ borderColor: borderSoft, margin: "0 0 16px 0" }} />
            <Text
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#6b7280",
                textAlign: "center",
                margin: 0,
              }}
            >
              {footer}
            </Text>
          </Section>
        </Container>
      </Body>
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
  reviewPageUrl: "https://bottie.ai/en/dashboard/accounts/123/businesses/456/reviews/789",
} as ReviewNotificationEmailProps;
