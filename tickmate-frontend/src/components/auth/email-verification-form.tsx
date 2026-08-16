"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi, getApiErrorMessage } from "@/lib/api";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "idle";

export default function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token found in URL");
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus("loading");
        await authApi.verifyEmail(token);
        setStatus("success");
        toast({
          title: "Success",
          description: "Your email has been verified successfully!",
        });
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        const errorMessage = getApiErrorMessage(err, "Failed to verify email");
        setError(errorMessage);
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, toast, router]);

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-lg ai-glow">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-ai"></div>
          <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Email Verification
          </CardTitle>
        </div>
        <CardDescription>Verifying your email address</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="relative w-12 h-12">
              <Loader2 className="w-full h-full animate-spin text-primary" />
              <div className="absolute inset-0 bg-gradient-ai opacity-30 rounded-full blur-md"></div>
            </div>
            <p className="text-center text-muted-foreground">
              Verifying your email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full gradient-ai flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gradient-ai">Email Verified!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your email has been verified successfully. Redirecting to sign
                in...
              </p>
            </div>
            <Button asChild className="w-full mt-4 ai-button">
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-destructive">
                Verification Failed
              </p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signup">Back to Sign Up</Link>
              </Button>
              <Button asChild className="flex-1 ai-button">
                <Link href="/auth/signin">Go to Sign In</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-accent" />
            </div>
            <p className="text-center text-muted-foreground">
              No verification token found. Please check your email for the
              verification link.
            </p>
            <Button asChild className="w-full ai-button">
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
