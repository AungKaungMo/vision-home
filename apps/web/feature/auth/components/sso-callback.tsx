"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { SIGNED_IN_URL } from "@/feature/auth/constants";
import { getClerkErrorMessage } from "@/feature/auth/lib/get-clerk-error-message";

export function SsoCallback() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    // The `hasRun` ref guarantees the flow executes exactly once, so even
    // though signIn/signUp are in the deps (their identity can change across
    // renders), the body never re-runs on a stale resource.
    if (!clerk.loaded || hasRun.current) return;

    hasRun.current = true;

    const navigate = (url: string) => {
      if (url.startsWith("http")) {
        window.location.assign(url);
        return;
      }

      router.replace(url);
    };

    const finalizeSignIn = async () => {
      let navigated = false;
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          navigated = true;
          navigate(decorateUrl(SIGNED_IN_URL));
        },
      });
      if (!navigated) router.replace(SIGNED_IN_URL);
    };

    const finalizeSignUp = async () => {
      let navigated = false;
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          navigated = true;
          navigate(decorateUrl(SIGNED_IN_URL));
        },
      });
      if (!navigated) router.replace(SIGNED_IN_URL);
    };

    const completeGoogleAuth = async () => {
      try {
        if (signIn.status === "complete") {
          await finalizeSignIn();
          return;
        }

        if (signUp.isTransferable) {
          await signIn.create({ transfer: true });

          if ((signIn.status as string) === "complete") {
            await finalizeSignIn();
            return;
          }
        }

        if (signIn.isTransferable) {
          await signUp.create({ transfer: true });

          if (signUp.status === "complete") {
            await finalizeSignUp();
            return;
          }
        }

        if (signUp.status === "complete") {
          await finalizeSignUp();
          return;
        }

        const existingSessionId =
          signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;

        if (existingSessionId) {
          await clerk.setActive({
            session: existingSessionId,
            navigate: ({ decorateUrl }) => {
              navigate(decorateUrl(SIGNED_IN_URL));
            },
          });
          return;
        }

        toast.error(
          "Google sign-in needs additional information. Please use email sign-in for now.",
        );
        router.replace("/auth/sign-in");
      } catch (error) {
        toast.error(
          getClerkErrorMessage(
            error,
            "Unable to complete Google sign-in. Please try again.",
          ),
        );
        router.replace("/auth/sign-in");
      }
    };

    void completeGoogleAuth();
  }, [clerk, router, signIn, signUp]);

  return (
    <div className="text-center" aria-live="polite">
      <h1 className="text-2xl">Completing sign-in…</h1>
      <p className="mt-3 text-sm text-fg-2">You&apos;ll be redirected shortly.</p>
      <div id="clerk-captcha" />
    </div>
  );
}
