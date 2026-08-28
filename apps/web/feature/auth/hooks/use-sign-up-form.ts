"use client";

import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  signUpSchema,
  type SignUpValues,
  verificationSchema,
  type VerificationValues,
} from "@repo/schemas/auth";

import { SIGNED_IN_URL } from "@/feature/auth/constants";
import { getClerkErrorMessage } from "@/feature/auth/lib/get-clerk-error-message";

export function useSignUpForm() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const navigateAfterSignUp = (url: string) => {
    if (url.startsWith("http")) {
      window.location.assign(url);
      return;
    }

    router.push(url);
  };

  const finalizeSignUp = async () => {
    let navigated = false;
    await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        navigated = true;
        navigateAfterSignUp(decorateUrl(SIGNED_IN_URL));
      },
    });
    // Guard: if Clerk resolved without invoking `navigate`, the account is
    // created but the user would be stranded — send them in explicitly.
    if (!navigated) router.push(SIGNED_IN_URL);
  };

  const submit = signUpForm.handleSubmit(async ({ name, email, password }) => {
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
    const lastName = lastNameParts.join(" ") || undefined;

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      if (error) {
        toast.error(
          getClerkErrorMessage(
            error,
            "Unable to create your account. Please try again.",
          ),
        );
        return;
      }
      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        toast.error(
          getClerkErrorMessage(
            verificationError,
            "Unable to send the verification code. Please try again.",
          ),
        );
        return;
      }

      setEmailAddress(email);
      setIsVerifying(true);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error(
        getClerkErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    }
  });

  const verify = verificationForm.handleSubmit(async ({ code }) => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        toast.error(
          getClerkErrorMessage(
            error,
            "The verification code is invalid or expired.",
          ),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      toast.error("Account verification could not be completed.");
    } catch (error) {
      toast.error(
        getClerkErrorMessage(
          error,
          "Unable to verify your email. Please try again.",
        ),
      );
    }
  });

  const resendVerificationCode = async () => {
    setIsResending(true);

    try {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        toast.error(
          getClerkErrorMessage(
            error,
            "Unable to resend the verification code.",
          ),
        );
        return;
      }

      toast.success("A new verification code has been sent.");
    } catch (error) {
      toast.error(
        getClerkErrorMessage(error, "Unable to resend the verification code."),
      );
    } finally {
      setIsResending(false);
    }
  };

  const restartSignUp = async () => {
    await signUp.reset();
    verificationForm.reset();
    signUpForm.reset();
    setEmailAddress("");
    setIsVerifying(false);
  };

  const signUpWithGoogle = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: SIGNED_IN_URL,
        redirectCallbackUrl: "/auth/sso-callback",
      });

      if (error) {
        toast.error(
          getClerkErrorMessage(
            error,
            "Unable to continue with Google. Please try again.",
          ),
        );
      }
    } catch (error) {
      toast.error(
        getClerkErrorMessage(
          error,
          "Unable to continue with Google. Please try again.",
        ),
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoading =
    signUpForm.formState.isSubmitting ||
    verificationForm.formState.isSubmitting ||
    isGoogleLoading ||
    fetchStatus === "fetching";

  return {
    signUpForm,
    verificationForm,
    isVerifying,
    emailAddress,
    isLoading,
    isGoogleLoading,
    isResending,
    submit,
    verify,
    resendVerificationCode,
    restartSignUp,
    signUpWithGoogle,
  };
}
