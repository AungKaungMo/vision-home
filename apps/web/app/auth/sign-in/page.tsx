import type { Metadata } from "next";

import { SignIn } from "@/feature/auth/components/sign-in";

export const metadata: Metadata = {
  title: "Sign in | VisionHome",
  description: "Sign in to continue designing your home with VisionHome.",
};

export default function SignInPage() {
  return <SignIn />;
}
