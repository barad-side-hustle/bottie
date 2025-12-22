import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text, Column, Row } from "@react-email/components";

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  positiveLabel: string;
  neutralLabel: string;
  negativeLabel: string;
}

export interface WeeklySummaryEmailProps {
  title: string;
  dateRange: string;
  businessName: string;

  statsTitle: string;
  totalReviewsLabel: string;
  averageRatingLabel: string;
  totalReviews: number;
  averageRating: string;

  sentimentTitle?: string;
  sentiment?: SentimentData;

  positiveThemesTitle: string;
  positiveThemes: string[];

  negativeThemesTitle: string;
  negativeThemes: string[];

  recommendationsTitle: string;
  recommendations: string[];

  viewDashboardButton: string;
  dashboardUrl: string;
  footer: string;
}

export default function WeeklySummaryEmail({
  title,
  dateRange,
  businessName,
  statsTitle,
  totalReviewsLabel,
  averageRatingLabel,
  totalReviews,
  averageRating,
  sentimentTitle,
  sentiment,
  positiveThemesTitle,
  positiveThemes,
  negativeThemesTitle,
  negativeThemes,
  recommendationsTitle,
  recommendations,
  viewDashboardButton,
  dashboardUrl,
  footer,
}: WeeklySummaryEmailProps) {
  const dir = "ltr";
  const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const primary = "#2A5E77";
  const bgOuter = "#F4F3EE";
  const bgContent = "#FFFFFF";
  const textDark = "#141414";
  const borderSoft = "#E2E2E0";

  const positiveColor = "#10b981";
  const negativeColor = "#ef4444";
  const recommendationColor = "#3b82f6";

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
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "16px",
                margin: "8px 0 0 0",
              }}
            >
              {businessName} • {dateRange}
            </Text>
          </Section>

          <Section style={{ padding: "32px 24px", color: textDark }}>
            <Section
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "32px",
              }}
            >
              <Heading
                as="h3"
                style={{
                  fontSize: "18px",
                  margin: "0 0 16px 0",
                  color: textDark,
                }}
              >
                {statsTitle}
              </Heading>
              <Row>
                <Column style={{ textAlign: "center", borderInlineEnd: `1px solid ${borderSoft}` }}>
                  <Text style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: primary }}>
                    {totalReviews}
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>{totalReviewsLabel}</Text>
                </Column>
                <Column style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: primary }}>
                    {averageRating}
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>{averageRatingLabel}</Text>
                </Column>
              </Row>
            </Section>

            {sentiment && sentimentTitle && (
              <Section
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  padding: "20px",
                  border: `1px solid ${borderSoft}`,
                  marginBottom: "32px",
                }}
              >
                <Heading
                  as="h3"
                  style={{
                    fontSize: "18px",
                    margin: "0 0 16px 0",
                    color: textDark,
                  }}
                >
                  {sentimentTitle}
                </Heading>
                <Row>
                  <Column style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: positiveColor }}>
                      {sentiment.positive}
                    </Text>
                    <Text style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                      {sentiment.positiveLabel}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#64748b" }}>
                      {sentiment.neutral}
                    </Text>
                    <Text style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                      {sentiment.neutralLabel}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: negativeColor }}>
                      {sentiment.negative}
                    </Text>
                    <Text style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                      {sentiment.negativeLabel}
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {positiveThemes.length > 0 && (
              <Section style={{ marginBottom: "24px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: positiveColor, marginInlineEnd: "8px" }}>●</span>
                  {positiveThemesTitle}
                </Heading>
                <ul style={{ paddingInlineStart: "20px", margin: 0 }}>
                  {positiveThemes.map((theme, i) => (
                    <li key={i} style={{ marginBottom: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                      {theme}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {negativeThemes.length > 0 && (
              <Section style={{ marginBottom: "24px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: negativeColor, marginInlineEnd: "8px" }}>●</span>
                  {negativeThemesTitle}
                </Heading>
                <ul style={{ paddingInlineStart: "20px", margin: 0 }}>
                  {negativeThemes.map((theme, i) => (
                    <li key={i} style={{ marginBottom: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                      {theme}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {recommendations.length > 0 && (
              <Section style={{ marginBottom: "32px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: recommendationColor, marginInlineEnd: "8px" }}>●</span>
                  {recommendationsTitle}
                </Heading>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#EFF6FF",
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "15px",
                        lineHeight: "1.5",
                        marginBottom: "8px",
                        color: "#1e3a8a",
                      }}
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section style={{ textAlign: "center", paddingTop: "8px" }}>
              <Button
                href={dashboardUrl}
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
                {viewDashboardButton}
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

WeeklySummaryEmail.PreviewProps = {
  title: "Weekly Summary",
  dateRange: "Nov 17 - Nov 23",
  businessName: "Example Business",
  statsTitle: "Weekly Overview",
  totalReviewsLabel: "Total Reviews",
  averageRatingLabel: "Average Rating",
  totalReviews: 15,
  averageRating: "4.8",
  sentimentTitle: "Sentiment Breakdown",
  sentiment: {
    positive: 12,
    neutral: 2,
    negative: 1,
    positiveLabel: "Positive",
    neutralLabel: "Neutral",
    negativeLabel: "Negative",
  },
  positiveThemesTitle: "Strengths",
  positiveThemes: ["Excellent and fast service", "Delicious food", "Pleasant atmosphere"],
  negativeThemesTitle: "Areas for Improvement",
  negativeThemes: ["Long wait time in the evening", "Music too loud"],
  recommendationsTitle: "Recommended Actions",
  recommendations: [
    "Consider adding more staff during evening shifts",
    "Reduce music volume during peak hours",
    "Continue maintaining the high level of service",
  ],
  viewDashboardButton: "View Dashboard",
  dashboardUrl: "https://www.bottie.ai",
  footer: "Sent by Bottie.ai",
} as WeeklySummaryEmailProps;
