import type { Metadata } from "next";

import { SignUp } from "@/feature/auth/components/sign-up";

export const metadata: Metadata = {
  title: "Sign up | VisionHome",
  description: "Create your VisionHome account and start redesigning.",
};

export default function SignUpPage() {
  return <SignUp />;
}
