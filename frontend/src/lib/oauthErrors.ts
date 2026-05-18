export type OAuthErrorCode = "cancelled" | "config" | "connection" | "unknown";

export class OAuthError extends Error {
  readonly code: OAuthErrorCode;

  constructor(message: string, code: OAuthErrorCode) {
    super(message);
    this.name = "OAuthError";
    this.code = code;
  }
}

export const isOAuthError = (error: unknown): error is OAuthError =>
  error instanceof OAuthError;

export const oauthUserMessage = (error: unknown): { title: string; message: string } => {
  if (isOAuthError(error)) {
    switch (error.code) {
      case "cancelled":
        return {
          title: "Astro Account Check",
          message: "You cancelled the sign-in.",
        };
      case "config":
        return {
          title: "Astro Account Check",
          message: error.message,
        };
      case "connection":
        return {
          title: "Astro Account Check",
          message: "We're having trouble connecting to the auth service. Check your connection and try again.",
        };
      default:
        return {
          title: "Astro Account Check",
          message: error.message || "Something went wrong during sign-in.",
        };
    }
  }

  if (error instanceof Error) {
    if (/cancel/i.test(error.message)) {
      return {
        title: "Astro Account Check",
        message: "You cancelled the sign-in.",
      };
    }
    return {
      title: "Astro Account Check",
      message: error.message,
    };
  }

  return {
    title: "Astro Account Check",
    message: "Something went wrong during sign-in.",
  };
};
