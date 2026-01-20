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
  Font,
  Hr,
  Button,
} from "@react-email/components";

export interface UserWelcomeEmailProps {
  userName: string;
  userEmail: string;
}

export default function UserWelcomeEmail({ userName }: UserWelcomeEmailProps) {
  const previewText = `Welcome to Bottie.ai, ${userName}!`;

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
                highlight: "#eab308",
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
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Welcome</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">Welcome to Bottie.ai</Heading>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground text-base font-bold m-0 mb-4">Hi {userName},</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                I&apos;m Alon, the founder of Bottie.ai. I noticed you recently signed up, and I wanted to personally
                reach out.
              </Text>

              <Text className="text-primary text-sm leading-relaxed m-0 mb-6 font-bold">
                As one of our first users, your experience means the world to us.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-6">
                I noticed you haven&apos;t fully completed the onboarding yet, and I&apos;d love to help you get set up
                so you can start saving time on your Google Reviews immediately.
              </Text>

              <div className="bg-[#1e1b4b] border-2 border-dashed border-[#eab308] rounded-xl p-6 py-8 text-center mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#eab308] text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                  Exclusive Gift
                </div>
                <Heading as="h3" className="text-[#eab308] text-xl font-bold m-0 mb-2 uppercase tracking-wide">
                  Golden Ticket
                </Heading>
                <Text className="text-muted text-sm m-0 mb-6 max-w-[400px] mx-auto">
                  To thank you for being a pioneer user, here is 3 months of full access on us.
                </Text>

                <div className="bg-white rounded-md px-6 py-4 inline-block shadow-2xl mx-auto border-4 border-[#eab308]/20">
                  <Text className="text-xs text-gray-500 uppercase font-bold m-0 mb-1 tracking-widest">
                    Coupon Code
                  </Text>
                  <Text className="text-3xl text-black font-mono font-bold m-0 tracking-[0.2em]">{`FREE3M`}</Text>
                </div>

                <Text className="text-[#eab308] text-xs font-bold m-0 mt-6 uppercase tracking-wider opacity-80">
                  Valid for 3 months • Full Access
                </Text>
              </div>

              <Section className="mb-8">
                <Text className="text-center text-foreground font-bold text-lg mb-6">What you can do right now:</Text>

                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-4 flex">
                  <div className="w-full sm:w-auto">
                    <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                      1. Automated Replies
                    </Heading>
                    <Text className="text-muted text-sm leading-relaxed m-0">
                      Connect your Google Business Profile and let Bottie.ai generate professional responses to every
                      review automatically.
                    </Text>
                  </div>
                </div>

                <div className="bg-background border border-solid border-border rounded-xl p-6 mb-6">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    2. Actionable Insights
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    Get instant analysis of your customer feedback. Spot trends, fix issues, and double down on what
                    works.
                  </Text>
                </div>
              </Section>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
                <Heading as="h3" className="text-foreground font-bold m-0 mb-2 text-lg">
                  Let&apos;s have a quick chat?
                </Heading>
                <Text className="text-muted text-sm leading-relaxed m-0 mb-6 max-w-[400px] mx-auto">
                  I&apos;d love to personally walk you through the setup and hear your feedback. Do you have 10 minutes
                  this week?
                </Text>
                <Button
                  href="mailto:alon@bottie.ai"
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-lg hover:bg-blue-600 transition-colors"
                >
                  Reply to Alon
                </Button>
              </div>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-6">
                I can&apos;t wait to help you transform how you handle customer reviews!
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mt-6">Best regards,</Text>

              <div className="mt-2">
                <Text className="text-foreground text-sm font-bold m-0">Alon</Text>
                <Text className="text-muted text-xs m-0">Founder, Bottie.ai</Text>
              </div>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">
                You&apos;re receiving this email because you signed up for Bottie.ai
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

UserWelcomeEmail.PreviewProps = {
  userName: "John",
  userEmail: "john@example.com",
} as UserWelcomeEmailProps;
