"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUpForm } from "@/feature/auth/hooks/use-sign-up-form";
import { GoogleIcon } from "@/lib/icons/google-icon";

export function SignUp() {
  const {
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
  } = useSignUpForm();

  const {
    register,
    formState: { errors },
  } = signUpForm;
  const {
    register: registerVerification,
    formState: { errors: verificationErrors },
  } = verificationForm;

  if (isVerifying) {
    return (
      <div>
        <div>
          <h1 className="text-3xl">Check your email</h1>
          <p className="mt-2 text-base text-fg-2">
            We sent a 6-digit code to {emailAddress}.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={verify} noValidate>
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-fg-2"
              htmlFor="verification-code"
            >
              Verification code
            </label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              aria-invalid={Boolean(verificationErrors.code)}
              aria-describedby={
                verificationErrors.code ? "verification-code-error" : undefined
              }
              className="h-12 rounded-xl bg-surface px-4 text-base tracking-wider placeholder:text-fg-3"
              {...registerVerification("code")}
            />
            {verificationErrors.code && (
              <p
                id="verification-code-error"
                role="alert"
                className="text-xs text-error"
              >
                {verificationErrors.code.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-primary hover:bg-terracotta-dark"
          >
            {isLoading && !isResending ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <div className="mt-4 flex justify-center gap-2 text-sm">
          <Button
            type="button"
            variant="link"
            disabled={isLoading}
            onClick={resendVerificationCode}
            className="text-terracotta"
          >
            {isResending ? "Sending…" : "Resend code"}
          </Button>
          <Button
            type="button"
            variant="link"
            disabled={isLoading}
            onClick={restartSignUp}
            className="text-fg-2"
          >
            Use another email
          </Button>
        </div>

        <div id="clerk-captcha" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Create your account</h1>
        <p className="mt-2 text-base text-fg-2">
          Start bringing your dream home to life.
        </p>
      </div>

      <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-fg-2" htmlFor="name">
            Full name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="h-12 rounded-xl bg-surface px-4 text-base placeholder:text-fg-3"
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-xs text-error">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-fg-2"
            htmlFor="signup-email"
          >
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className="h-12 rounded-xl bg-surface px-4 text-base placeholder:text-fg-3"
            {...register("email")}
          />
          {errors.email && (
            <p
              id="signup-email-error"
              role="alert"
              className="text-xs text-error"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-fg-2"
            htmlFor="signup-password"
          >
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            className="h-12 rounded-xl bg-surface px-4 text-base placeholder:text-fg-3"
            {...register("password")}
          />
          {errors.password && (
            <p
              id="signup-password-error"
              role="alert"
              className="text-xs text-error"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl text-base font-semibold shadow-primary hover:bg-terracotta-dark"
        >
          {isLoading && !isGoogleLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs font-medium tracking-wide text-fg-3">
        <span className="h-px flex-1 bg-divider" />
        <span>OR</span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={signUpWithGoogle}
        disabled={isLoading}
        className="h-12 w-full rounded-xl border-border-strong bg-surface text-base font-semibold hover:bg-terracotta-muted"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Connecting to Google…" : "Continue with Google"}
      </Button>

      <div id="clerk-captcha" />

      <p className="mt-5 text-center text-sm text-fg-2">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-terracotta hover:text-terracotta-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
