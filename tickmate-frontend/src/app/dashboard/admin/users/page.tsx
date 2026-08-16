"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  UsersTable,
  type AdminUserRow,
  type UserRole,
} from "@/components/admin/user-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getUsers();
        const normalizedUsers = Array.isArray(response.users)
          ? response.users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              username: user.username,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt,
            }))
          : [];
        setUsers(normalizedUsers);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessage(error, "Failed to load users"),
          variant: "destructive",
        });

        if (
          (error as any)?.response?.status === 401 ||
          (error as any)?.response?.status === 403
        ) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [router, toast]);

  const handleUserUpdated = async (payload: {
    userId: number;
    role: UserRole;
    isActive: boolean;
  }) => {
    const response = await adminApi.updateUser(payload);
    const updatedUser = response.user;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === payload.userId
          ? {
              ...user,
              role: updatedUser.role,
              isActive: updatedUser.isActive,
            }
          : user,
      ),
    );

    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  const handleUserDeleted = async (userId: number) => {
    await adminApi.deleteUser(userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));

    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <DashboardHeader
        title="User Management"
        subtitle="Update user roles, status, and account access"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or username"
            className="pl-9"
          />
        </div>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <UsersTable
                users={filteredUsers}
                onUserUpdated={handleUserUpdated}
                onUserDeleted={handleUserDeleted}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
