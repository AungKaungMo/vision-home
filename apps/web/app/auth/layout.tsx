import { AuthLayout as AuthFeatureLayout } from "@/feature/auth/components/auth-layout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthFeatureLayout>{children}</AuthFeatureLayout>;
}
