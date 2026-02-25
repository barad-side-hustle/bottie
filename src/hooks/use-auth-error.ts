import { useTranslations } from "next-intl";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Invalid email or password": "invalidEmailOrPassword",
  "Invalid email": "invalidEmail",
  "Invalid password": "invalidPassword",
  "User already exists": "userAlreadyExists",
  "User already exists. Use another email.": "userAlreadyExists",
  "Password too short": "passwordTooShort",
  "Password too long": "passwordTooLong",
  "Email not verified": "emailNotVerified",
  "Invalid token": "invalidToken",
  "User not found": "userNotFound",
  "User email not found": "userNotFound",
  "Session expired. Re-authenticate to perform this action.": "sessionExpired",
  "Credential account not found": "invalidEmailOrPassword",
};

export function useAuthError() {
  const t = useTranslations("auth.errors");

  return (errorMessage: string | undefined): string => {
    if (!errorMessage) return t("generic");

    const key = ERROR_MESSAGE_MAP[errorMessage];
    if (key) return t(key);

    return t("generic");
  };
}
