"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUserData,
  updateUserSchema,
  UserResponse,
} from "@/lib/schemas";
import { authApi, getApiErrorMessage, userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

interface EditProfileDialogProps {
  user: UserResponse;
  onProfileUpdate: (updatedUser: UserResponse) => void;
}

export function EditProfileDialog({
  user,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema as any),
    defaultValues: {
      name: user.name,
      username: user.username,
      email: user.email,
      skills: user.skills,
    },
  });

  const onSubmit = async (data: UpdateUserData) => {
    try {
      setIsLoading(true);

      const nextUsername = data.username?.trim();
      const currentUsername = user.username?.trim();

      if (nextUsername && nextUsername !== currentUsername) {
        setIsCheckingUsername(true);
        const availabilityRes =
          await authApi.checkUsernameAvailability(nextUsername);
        const isAvailable = Boolean(
          availabilityRes?.available ?? availabilityRes?.data?.available,
        );

        if (!isAvailable) {
          setError("username", {
            type: "manual",
            message: "Username is already taken",
          });

          toast({
            title: "Username unavailable",
            description: "Please choose a different username",
            variant: "destructive",
          });
          return;
        }

        clearErrors("username");
      }

      const submitData = {
        name: data.name,
        username: nextUsername,
        skills,
      };
      const response = await userApi.updateProfile(submitData);
      const updatedUser = response?.user ?? response?.data?.user;

      if (updatedUser) {
        onProfileUpdate(updatedUser);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to update profile"),
        variant: "destructive",
      });
    } finally {
      setIsCheckingUsername(false);
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ai-button">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Your full name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Your username"
              disabled={isLoading || isCheckingUsername}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="your@email.com"
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          {/* Skills Field */}
          <div className="space-y-2">
            <Label htmlFor="skill">Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skill"
                placeholder="Add a skill and press button"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                disabled={isLoading || isCheckingUsername}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                disabled={isLoading || isCheckingUsername}
                size="sm"
              >
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="gradient-ai text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-md"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-white text-primary-foreground/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading || isCheckingUsername}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 ai-button"
              disabled={isLoading || isCheckingUsername}
            >
              {isCheckingUsername
                ? "Checking username..."
                : isLoading
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
