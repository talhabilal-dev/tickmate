import { Suspense } from "react";
import EmailVerificationForm from "@/components/auth/email-verification-form";

export const metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationForm />
    </Suspense>
  );
}
