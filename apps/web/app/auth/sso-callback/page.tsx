import type { Metadata } from "next";

import { SsoCallback } from "@/feature/auth/components/sso-callback";

export const metadata: Metadata = {
  title: "Completing sign-in | VisionHome",
};

export default function SsoCallbackPage() {
  return <SsoCallback />;
}
