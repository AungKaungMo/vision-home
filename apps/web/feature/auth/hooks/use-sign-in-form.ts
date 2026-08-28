"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  signInSchema,
  type SignInValues,
} from "@repo/schemas/auth";

import { SIGNED_IN_URL } from "@/feature/auth/constants";
import { getClerkErrorMessage } from "@/feature/auth/lib/get-clerk-error-message";

export function useSignInForm() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigateAfterSignIn = (url: string) => {
    if (url.startsWith("http")) {
      window.location.assign(url);
      return;
    }

    router.push(url);
  };

  const submit = handleSubmit(async ({ email, password }) => {
    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        toast.error(
          getClerkErrorMessage(error, "Email or password is incorrect."),
        );
        return;
      }

      if (signIn.status === "complete") {
        let navigated = false;
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            navigated = true;
            navigateAfterSignIn(decorateUrl(SIGNED_IN_URL));
          },
        });
        // Guard: if Clerk resolved without invoking `navigate`, the session is
        // set but the user would be stranded — send them in explicitly.
        if (!navigated) router.push(SIGNED_IN_URL);
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        toast.error("Additional account verification is required to sign in.");
        return;
      }

      toast.error("Sign-in could not be completed. Please try again.");
    } catch (error) {
      toast.error(
        getClerkErrorMessage(error, "Unable to sign in. Please try again."),
      );
    }
  });

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await signIn.sso({
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
    isSubmitting || isGoogleLoading || fetchStatus === "fetching";

  return {
    register,
    errors,
    isLoading,
    isGoogleLoading,
    submit,
    signInWithGoogle,
  };
}
