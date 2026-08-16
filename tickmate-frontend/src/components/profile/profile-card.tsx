"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserResponse } from "@/lib/schemas";
import { Mail, User, Calendar, Shield } from "lucide-react";

interface ProfileCardProps {
  user: UserResponse;
  onEditClick: () => void;
  needsEmailVerification?: boolean;
  onVerifyEmail?: () => void;
}

export function ProfileCard({
  user,
  onEditClick,
  needsEmailVerification,
  onVerifyEmail,
}: ProfileCardProps) {
  return (
    <Card className="border-primary/20 shadow-lg ai-glow">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <div className="w-10 h-10 rounded-full gradient-ai flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          {user.name}
        </CardTitle>
        <CardDescription>@{user.username}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{user.email}</p>
            {needsEmailVerification && onVerifyEmail && (
              <Button
                size="sm"
                className="ai-button text-xs"
                onClick={onVerifyEmail}
              >
                Verify Email
              </Button>
            )}
          </div>
        </div>

        {/* Role Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Role</span>
          </div>
          <Badge className="gradient-ai text-primary-foreground capitalize">
            {user.role}
          </Badge>
        </div>

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-primary/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Account Created Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Member since</span>
          </div>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Edit Button */}
        {/* <Button onClick={onEditClick} className="w-full ai-button">
          Edit Profile
        </Button> */}
      </CardContent>
    </Card>
  );
}
