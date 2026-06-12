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

interface UserWelcomeEmailProps {
  userName: string;
  userEmail: string;
}

export default function UserWelcomeEmail({ userName }: UserWelcomeEmailProps) {
  const previewText = `Welcome to Bottie.ai, ${userName}!`;

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

            <Section className="mb-6 text-center">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Welcome</Text>
              <Heading className="text-foreground text-2xl font-bold p-0 m-0">Welcome to Bottie.ai</Heading>
            </Section>

            <Hr className="border-border mx-0 w-full" />

            <Section className="my-6">
              <Text className="text-foreground text-base font-bold m-0 mb-4">Hi {userName},</Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-4">
                I&apos;m Alon, the founder of Bottie.ai. I noticed you recently signed up, and I wanted to personally
                reach out.
              </Text>

              <Text className="text-foreground text-sm leading-relaxed m-0 mb-6 font-bold">
                As one of our first users, your experience means the world to us.
              </Text>

              <Text className="text-muted text-sm leading-relaxed m-0 mb-6">
                I noticed you haven&apos;t fully completed the onboarding yet, and I&apos;d love to help you get set up
                so you can start saving time on your Google Reviews immediately.
              </Text>

              <div className="bg-surface border border-solid border-border rounded-xl p-6 py-8 text-center mb-8">
                <Text className="text-warning text-xs font-bold uppercase tracking-wider m-0 mb-2">Welcome gift</Text>
                <Heading as="h3" className="text-foreground text-xl font-bold m-0 mb-2">
                  3 months on us
                </Heading>
                <Text className="text-muted text-sm m-0 mb-6 max-w-[400px] mx-auto">
                  To thank you for being a pioneer user, here is 3 months of full access on us.
                </Text>

                <div className="bg-card rounded-md px-6 py-4 inline-block mx-auto border border-solid border-primary">
                  <Text className="text-xs text-subtle uppercase font-bold m-0 mb-1 tracking-widest">Coupon Code</Text>
                  <Text className="text-3xl text-primary font-mono font-bold m-0 tracking-[0.2em]">{`FREE3M`}</Text>
                </div>

                <Text className="text-subtle text-xs font-bold m-0 mt-6 uppercase tracking-wider">
                  Valid for 3 months • Full Access
                </Text>
              </div>

              <Section className="mb-8">
                <Text className="text-center text-foreground font-bold text-lg mb-6">What you can do right now:</Text>

                <div className="bg-surface border border-solid border-border rounded-xl p-6 mb-4">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    1. Automated Replies
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    Connect your Google Business Profile and let Bottie.ai generate professional responses to every
                    review automatically.
                  </Text>
                </div>

                <div className="bg-surface border border-solid border-border rounded-xl p-6 mb-6">
                  <Heading as="h3" className="text-primary font-bold m-0 mb-2 text-base">
                    2. Actionable Insights
                  </Heading>
                  <Text className="text-muted text-sm leading-relaxed m-0">
                    Get instant analysis of your customer feedback. Spot trends, fix issues, and double down on what
                    works.
                  </Text>
                </div>
              </Section>

              <div className="bg-accent-tint border border-solid border-primary rounded-xl p-6 text-center">
                <Heading as="h3" className="text-foreground font-bold m-0 mb-2 text-lg">
                  Let&apos;s have a quick chat?
                </Heading>
                <Text className="text-muted text-sm leading-relaxed m-0 mb-6 max-w-[400px] mx-auto">
                  I&apos;d love to personally walk you through the setup and hear your feedback. Do you have 10 minutes
                  this week?
                </Text>
                <Button
                  href="mailto:alon@bottie.ai"
                  className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline"
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
                <Text className="text-subtle text-xs m-0">Founder, Bottie.ai</Text>
              </div>
            </Section>

            <Hr className="border-border mx-0 w-full mt-6" />

            <Section className="mt-6">
              <Text className="text-subtle text-xs text-center">
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
