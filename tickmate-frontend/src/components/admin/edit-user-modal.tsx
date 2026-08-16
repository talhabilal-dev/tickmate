"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type UserRole = "user" | "moderator" | "admin";

type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    userId: number;
    role: UserRole;
    isActive: boolean;
  }) => Promise<void> | void;
}

export function EditUserModal({
  open,
  user,
  onOpenChange,
  onSave,
}: EditUserModalProps) {
  const [role, setRole] = useState<UserRole>("user");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setRole(user.role);
    setIsActive(user.isActive);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await onSave({
        userId: user.id,
        role,
        isActive,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/20">
        <DialogHeader>
          <DialogTitle>Edit User Access</DialogTitle>
          <DialogDescription>
            Update role and active status for{" "}
            <span className="font-medium">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isSaving}
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is-active">Account Status</Label>
            <select
              id="is-active"
              value={isActive ? "active" : "inactive"}
              onChange={(event) => setIsActive(event.target.value === "active")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isSaving}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="ai-button"
            onClick={handleSave}
            disabled={isSaving || !user}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
