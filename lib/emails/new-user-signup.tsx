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

export interface NewUserSignupEmailProps {
  userName: string;
  userEmail: string;
  userId: string;
  signupTimestamp: Date;
  dashboardUrl: string;
}

export default function NewUserSignupEmail({
  userName,
  userEmail,
  userId,
  signupTimestamp,
  dashboardUrl,
}: NewUserSignupEmailProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(signupTimestamp);

  const previewText = `New user signup: ${userName}`;

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
            <Section className="mt-8 mb-8 text-center">
              <Heading className="text-foreground text-2xl font-bold p-0 m-0 leading-tight">New User Signup</Heading>
              <Text className="text-muted text-sm m-0 mt-2">A new user has joined the platform</Text>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full" />

            <Section className="my-6 p-6 bg-background rounded-xl border border-border border-solid">
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">Name</Text>
                <Text className="text-foreground text-lg font-bold m-0">{userName}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">Email</Text>
                <Text className="text-primary text-base m-0 font-medium no-underline">{userEmail}</Text>
              </div>
              <div className="mb-4 text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">User ID</Text>
                <Text className="text-foreground text-sm font-mono m-0 bg-black/20 p-1 rounded inline-block">
                  {userId}
                </Text>
              </div>
              <div className="text-center sm:text-left">
                <Text className="text-muted text-xs font-bold uppercase tracking-wider m-0 mb-1">Signed Up At</Text>
                <Text className="text-foreground text-sm m-0">{formattedDate}</Text>
              </div>
            </Section>

            <Section className="text-center mt-8">
              <Button
                href={dashboardUrl}
                className="bg-primary text-white rounded-md px-6 py-3 text-sm font-bold no-underline shadow-lg transiton-all hover:bg-blue-600"
              >
                View User Dashboard
              </Button>
            </Section>

            <Hr className="border-border opacity-50 mx-0 w-full mt-8" />

            <Section className="mt-6">
              <Text className="text-muted text-xs text-center">Bottie.ai System Notification</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

NewUserSignupEmail.PreviewProps = {
  userName: "John Doe",
  userEmail: "john@example.com",
  userId: "123e4567-e89b-12d3-a456-426614174000",
  signupTimestamp: new Date(),
  dashboardUrl: "https://bottie.ai/dashboard",
} as NewUserSignupEmailProps;
