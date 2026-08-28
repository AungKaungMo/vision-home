import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

export function getClerkErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (isClerkAPIResponseError(error)) {
    const clerkError = error.errors[0];

    return clerkError?.longMessage || clerkError?.message || fallback;
  }

  if (error && typeof error === "object" && "longMessage" in error) {
    const longMessage = error.longMessage;

    if (typeof longMessage === "string") return longMessage;
  }

  return fallback;
}
