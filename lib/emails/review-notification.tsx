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
  Row,
  Column,
} from "@react-email/components";

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
    <span
      key={i}
      style={{
        color: i < rating ? "#eab308" : "#525252",
        fontSize: "18px",
        marginRight: "2px",
      }}
    >
      ★
    </span>
  ));

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
                success: "#22c55e",
                warning: "#eab308",
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
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">New Activity</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">{title}</Heading>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground text-base font-bold m-0 mb-2">{greeting}</Text>
              <Text className="text-muted text-sm m-0 mb-6">
                {body} <span className="text-foreground font-bold">{businessName}</span>
              </Text>

              <div className="bg-[#1e1b4b] border border-solid border-[#2e1065] rounded-xl overflow-hidden mb-8 shadow-sm">
                <div className="bg-[#2e1065]/50 px-6 py-4 border-b border-[#2e1065]">
                  <Row>
                    <Column className="align-middle">
                      <Text className="text-lg font-bold text-foreground m-0">{reviewerName}</Text>
                    </Column>
                    <Column className="align-middle text-right" style={{ width: "140px" }}>
                      <div className="inline-block bg-black/20 rounded px-3 py-1">
                        <div className="text-yellow-500 tracking-widest text-lg leading-none">{stars}</div>
                      </div>
                    </Column>
                  </Row>
                </div>
                <div className="p-6">
                  <Text className="text-muted text-lg leading-relaxed m-0 italic font-medium">
                    &ldquo;{reviewText || noReviewText}&rdquo;
                  </Text>
                </div>
              </div>

              {aiReply ? (
                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-8 relative">
                  <Row className="mb-4">
                    <Column className="align-middle">
                      <Text className="text-xs font-bold uppercase text-primary m-0 tracking-wider">
                        {aiReplyHeader}
                      </Text>
                    </Column>
                    <Column className="align-middle text-right">
                      <Button
                        className={`text-[10px] font-bold px-3 py-1 rounded-full no-underline cursor-default ${
                          status === "posted"
                            ? "text-green-400 bg-green-900/30 border border-green-800"
                            : "text-blue-400 bg-blue-900/30 border border-blue-800"
                        }`}
                      >
                        {statusText}
                      </Button>
                    </Column>
                  </Row>

                  <div className="pl-4 border-l-2 border-primary">
                    <Text className="text-foreground text-sm leading-relaxed m-0 whitespace-pre-wrap font-sans">
                      {aiReply}
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="bg-background border border-solid border-red-800/50 rounded-xl p-6 mb-8 relative">
                  <Text className="text-red-400 text-sm font-bold m-0 mb-2">{statusText}</Text>
                  <Text className="text-muted text-sm m-0">Please visit the dashboard to reply manually.</Text>
                </div>
              )}

              <div className="text-center mt-6">
                <Button
                  href={reviewPageUrl}
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline"
                >
                  {viewReviewButton}
                </Button>
              </div>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">{footer}</Text>
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
  reviewPageUrl: "https://bottie.ai/en/dashboard/locations/456/reviews/789",
} as ReviewNotificationEmailProps;
