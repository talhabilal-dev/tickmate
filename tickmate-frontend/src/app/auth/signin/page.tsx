"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Shield, Users } from "lucide-react";

export default function SignInPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Welcome Back
        </p>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight text-gradient-ai">
          Choose Your Role
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Sign in as a user or an administrator to continue to the right
          workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/auth/signin/user" className="group">
          <Card className="h-full border-primary/20 transition-all duration-200 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">User Account</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Personal dashboard and ticket workflow
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in with your email or username to manage your profile,
                create tickets, and track progress.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Continue as User
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/auth/signin/admin" className="group">
          <Card className="h-full border-secondary/20 transition-all duration-200 hover:border-secondary/60 hover:shadow-xl hover:shadow-secondary/20">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-secondary to-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Account</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  System management and moderation tools
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use admin credentials to access the control panel, manage users,
                and monitor platform operations.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                Continue as Admin
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Button
          asChild
          variant="outline"
          className="border-primary/30 hover:bg-primary/5"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </section>
  );
}
