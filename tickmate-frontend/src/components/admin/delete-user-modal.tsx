"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type User = {
  id: number;
  name: string;
  email: string;
};

interface DeleteUserModalProps {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (userId: number) => Promise<void> | void;
  isDeleting: boolean;
}

export function DeleteUserModal({
  open,
  user,
  onOpenChange,
  onDelete,
  isDeleting,
}: DeleteUserModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-primary/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-medium">{user?.name}</span> ({user?.email}).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting || !user}
            onClick={(event) => {
              event.preventDefault();
              if (!user) return;
              void onDelete(user.id);
            }}
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
