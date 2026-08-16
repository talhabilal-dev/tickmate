"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { DeleteUserModal } from "@/components/admin/delete-user-modal";
import { Edit2, Trash2 } from "lucide-react";

export type UserRole = "user" | "moderator" | "admin";

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: AdminUserRow[];
  onUserUpdated?: (payload: {
    userId: number;
    role: UserRole;
    isActive: boolean;
  }) => Promise<void> | void;
  onUserDeleted?: (userId: number) => Promise<void> | void;
}

export function UsersTable({
  users,
  onUserUpdated,
  onUserDeleted,
}: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (user: AdminUserRow) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: AdminUserRow) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveUser = async (payload: {
    userId: number;
    role: UserRole;
    isActive: boolean;
  }) => {
    await onUserUpdated?.(payload);
  };

  const handleConfirmDelete = async (userId: number) => {
    setIsDeleting(true);
    try {
      await onUserDeleted?.(userId);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-300";
      case "moderator":
        return "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300";
      case "user":
        return "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300";
      default:
        return "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300";
    }
  };

  return (
    <>
      <div className="rounded-lg border border-primary/10 bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-primary/10 hover:bg-muted/30"
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-foreground/75">
                  {user.email}
                </TableCell>
                <TableCell className="text-foreground/75">
                  {user.username}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getRoleBadgeColor(user.role)}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.isActive
                        ? "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-300"
                        : "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(user)}
                      className="text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(user)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUserModal
        open={editModalOpen}
        user={editingUser}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveUser}
      />

      <DeleteUserModal
        open={deleteModalOpen}
        user={deletingUser}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
