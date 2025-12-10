"use client";

import { useState } from "react";
import Link from "next/link";
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
    Pencil,
    Eye,
    EyeOff,
    Trash2,
    Loader2,
} from "lucide-react";
import { toggleChallengeStatus, deleteChallenge } from "@/app/admin/actions";

interface ChallengeActionsProps {
    challengeId: string;
    isActive: boolean;
    title: string;
}

export default function ChallengeActions({
    challengeId,
    isActive,
    title,
}: ChallengeActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggleStatus = async () => {
        if (loading) return;
        setLoading(true);

        const result = await toggleChallengeStatus(challengeId, !isActive);

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
            `Are you sure you want to delete "${title}"? This will also delete all user solves associated with it.`,
        );

        if (!confirmed) return;

        setLoading(true);
        const result = await deleteChallenge(challengeId);

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

                <DropdownMenuItem asChild>
                    <Link
                        href={`/admin/challenges/edit/${challengeId}`}
                        className="cursor-pointer flex items-center hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit Details</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                >
                    {isActive ? (
                        <div className="flex items-center text-yellow-500">
                            <EyeOff className="mr-2 h-4 w-4" />
                            <span>Hide Challenge</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-green-500">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Publish Challenge</span>
                        </div>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-800" />

                <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-red-500 hover:bg-red-900/20 focus:bg-red-900/20 focus:text-red-400"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Challenge</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
