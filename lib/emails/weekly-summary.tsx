import {
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Font,
  Body,
  Container,
  Button,
  Head,
  Row,
  Column,
} from "@react-email/components";

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
  const previewText = `Weekly Summary for ${businessName}: ${dateRange}`;

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
                destructive: "#ef4444",
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
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Performance Report</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0 leading-tight">{title}</Heading>
              <Text className="text-muted text-sm m-0 mt-2">
                {businessName} • {dateRange}
              </Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <div className="bg-[#1e1b4b] border border-solid border-[#2e1065] rounded-xl p-6 mb-8">
                <Heading
                  as="h3"
                  className="text-foreground text-sm font-bold uppercase tracking-widest m-0 mb-6 border-b border-[#2e1065] pb-2"
                >
                  {statsTitle}
                </Heading>

                <Row>
                  <Column className="w-1/2 align-top text-center border-r border-[#2e1065]">
                    <Text className="text-4xl font-bold text-primary m-0 mb-1">{totalReviews}</Text>
                    <Text className="text-[10px] text-muted font-bold uppercase tracking-widest m-0">
                      {totalReviewsLabel}
                    </Text>
                  </Column>
                  <Column className="w-1/2 align-top text-center">
                    <Text className="text-4xl font-bold text-white m-0 mb-1">{averageRating}</Text>
                    <Text className="text-[10px] text-muted font-bold uppercase tracking-widest m-0">
                      {averageRatingLabel}
                    </Text>
                  </Column>
                </Row>
              </div>

              {sentiment && sentimentTitle && (
                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-8">
                  <Heading
                    as="h3"
                    className="text-foreground text-sm font-bold uppercase tracking-widest m-0 mb-6 border-b border-border pb-2"
                  >
                    {sentimentTitle}
                  </Heading>
                  <Row>
                    <Column className="w-1/3 align-top text-center">
                      <Text className="text-2xl font-bold text-[#22c55e] m-0 mb-1">{sentiment.positive}</Text>
                      <Text className="text-[10px] text-muted font-bold uppercase tracking-widest m-0">
                        {sentiment.positiveLabel}
                      </Text>
                    </Column>
                    <Column className="w-1/3 align-top text-center">
                      <Text className="text-2xl font-bold text-gray-500 m-0 mb-1">{sentiment.neutral}</Text>
                      <Text className="text-[10px] text-muted font-bold uppercase tracking-widest m-0">
                        {sentiment.neutralLabel}
                      </Text>
                    </Column>
                    <Column className="w-1/3 align-top text-center">
                      <Text className="text-2xl font-bold text-[#ef4444] m-0 mb-1">{sentiment.negative}</Text>
                      <Text className="text-[10px] text-muted font-bold uppercase tracking-widest m-0">
                        {sentiment.negativeLabel}
                      </Text>
                    </Column>
                  </Row>
                </div>
              )}

              {(positiveThemes.length > 0 || negativeThemes.length > 0) && (
                <div className="mb-8">
                  {positiveThemes.length > 0 && (
                    <div className="mb-6">
                      <Text className="text-xs font-bold uppercase text-[#22c55e] tracking-widest mb-3 border-b border-[#22c55e]/20 pb-1">
                        {positiveThemesTitle}
                      </Text>
                      <div className="inline-block">
                        {positiveThemes.map((theme, i) => (
                          <span
                            key={i}
                            className="inline-block bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold px-3 py-1 rounded-full mr-2 mb-2 border border-[#22c55e]/20"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {negativeThemes.length > 0 && (
                    <div className="mb-2">
                      <Text className="text-xs font-bold uppercase text-[#ef4444] tracking-widest mb-3 border-b border-[#ef4444]/20 pb-1">
                        {negativeThemesTitle}
                      </Text>
                      <div className="inline-block">
                        {negativeThemes.map((theme, i) => (
                          <span
                            key={i}
                            className="inline-block bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold px-3 py-1 rounded-full mr-2 mb-2 border border-[#ef4444]/20"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="mb-6">
                  <Heading as="h3" className="text-base text-foreground font-bold uppercase tracking-wider m-0 mb-3">
                    <span className="text-primary mr-2">●</span>
                    {recommendationsTitle}
                  </Heading>
                  <div className="flex flex-col gap-2">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 text-sm text-blue-200"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <Button
                  href={dashboardUrl}
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline"
                >
                  {viewDashboardButton}
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
