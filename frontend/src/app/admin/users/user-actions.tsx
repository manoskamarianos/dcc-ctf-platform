"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Shield,
    ShieldAlert,
    Trash2,
    Loader2,
} from "lucide-react";
import { toggleUserRole, deleteUser } from "@/app/admin/actions";

interface UserActionsProps {
    userId: string;
    isAdmin: boolean;
    username: string;
}

export default function UserActions({
    userId,
    isAdmin,
    username,
}: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggleRole = async () => {
        if (loading) return;
        setLoading(true);

        const result = await toggleUserRole(userId, !isAdmin);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (loading) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        setLoading(true);
        const result = await deleteUser(userId);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400"
                >
                    <span className="sr-only">Open menu</span>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-gray-900 border-gray-800 text-white"
            >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />

                <DropdownMenuItem
                    onClick={handleToggleRole}
                    className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                >
                    {isAdmin ? (
                        <div className="flex items-center text-yellow-500">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Revoke Admin</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-terminal-green">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Make Admin</span>
                        </div>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-800" />

                <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-red-500 hover:bg-red-900/20 focus:bg-red-900/20 focus:text-red-400"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete User</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
