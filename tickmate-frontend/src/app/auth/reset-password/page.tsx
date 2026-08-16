import { Suspense } from "react";
import ResetPasswordPageContent from "@/components/auth/reset-password-page-content";

export const metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
