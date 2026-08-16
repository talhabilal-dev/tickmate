"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileCard } from "@/components/profile/profile-card";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { userApi, authApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UserResponse } from "@/lib/schemas";
import { LogOut } from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileRes = await userApi.getProfile();
        const resolvedUser = profileRes?.user ?? profileRes?.data?.user ?? null;
        setUser(resolvedUser);
      } catch (error: any) {
        toast({
          title: "Error",
          description: getApiErrorMessage(error, "Failed to load profile"),
          variant: "destructive",
        });

        if (error.response?.status === 401) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      router.push("/auth/signin");
    } catch (_error) {
      router.push("/auth/signin");
    }
  };

  const handleProfileUpdate = (updatedUser: UserResponse) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-ai mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="border-primary/20 shadow-lg ai-glow">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Unable to load your profile
            </p>
            <Button asChild className="w-full ai-button">
              <a href="/auth/signin">Return to Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <header className="border-b border-primary/10 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gradient-ai">Profile</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Your Profile</h2>
          <p className="text-muted-foreground">
            Manage your profile and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <ProfileCard
              user={user}
              onEditClick={() => {
                // EditProfileDialog below handles edit actions.
              }}
            />
          </div>

          <Card className="border-primary/20 shadow-lg ai-glow h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
              <CardDescription>
                Manage your security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <EditProfileDialog
                user={user}
                onProfileUpdate={handleProfileUpdate}
              />
              <ChangePasswordDialog />
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
