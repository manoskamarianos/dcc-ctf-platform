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
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { deleteContest } from "@/app/admin/actions";

interface ContestActionsProps {
    contestId: string;
    title: string;
}

export default function ContestActions({
    contestId,
    title,
}: ContestActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (loading) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"?`,
        );

        if (!confirmed) return;

        setLoading(true);
        const result = await deleteContest(contestId);

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
                        href={`/admin/contests/edit/${contestId}`}
                        className="cursor-pointer flex items-center hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit Details</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-800" />

                <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-red-500 hover:bg-red-900/20 focus:bg-red-900/20 focus:text-red-400"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Contest</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
