"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInForm } from "@/feature/auth/hooks/use-sign-in-form";
import { GoogleIcon } from "@/lib/icons/google-icon";

export function SignIn() {
  const {
    register,
    errors,
    isLoading,
    isGoogleLoading,
    submit,
    signInWithGoogle,
  } = useSignInForm();

  return (
    <div>
      <div>
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mt-2 text-base text-fg-2">Sign in to keep designing.</p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={submit}
        noValidate
      >
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-fg-2" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="h-12 rounded-xl bg-surface px-4 text-base placeholder:text-fg-3"
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-fg-2"
            htmlFor="password"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="h-12 rounded-xl bg-surface px-4 text-base placeholder:text-fg-3"
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl text-base font-semibold shadow-primary hover:bg-terracotta-dark"
        >
          {isLoading && !isGoogleLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium tracking-wide text-fg-3">
        <span className="h-px flex-1 bg-divider" />
        <span>OR</span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="h-12 w-full rounded-xl border-border-strong bg-surface text-base font-semibold hover:bg-terracotta-muted"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Connecting to Google…" : "Continue with Google"}
      </Button>

      <p className="mt-6 text-center text-sm text-fg-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-terracotta hover:text-terracotta-dark"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}
