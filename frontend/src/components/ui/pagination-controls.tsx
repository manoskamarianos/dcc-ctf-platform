"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    totalItems: number;
    itemsPerPage: number;
    baseUrl: string; // e.g., "/challenges" or "/machines"
}

export default function PaginationControls({
    totalItems,
    itemsPerPage,
    baseUrl,
}: PaginationControlsProps) {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // If there's only one page (or no items), don't render controls
    if (totalPages <= 1) return null;

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-center gap-4 py-8 border-t border-gray-900 mt-8">
            <Button
                variant="outline"
                size="sm"
                className={`font-mono border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10 ${
                    !hasPrev ? "opacity-50 cursor-not-allowed" : ""
                }`}
                asChild={hasPrev}
                disabled={!hasPrev}
            >
                {hasPrev ? (
                    <Link href={`${baseUrl}?page=${currentPage - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        PREV
                    </Link>
                ) : (
                    <span className="flex items-center">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        PREV
                    </span>
                )}
            </Button>

            <div className="flex flex-col items-center">
                <span className="text-white font-mono font-bold text-sm">
                    PAGE {currentPage} <span className="text-gray-600">/</span>{" "}
                    {totalPages}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                    {totalItems} RECORDS FOUND
                </span>
            </div>

            <Button
                variant="outline"
                size="sm"
                className={`font-mono border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10 ${
                    !hasNext ? "opacity-50 cursor-not-allowed" : ""
                }`}
                asChild={hasNext}
                disabled={!hasNext}
            >
                {hasNext ? (
                    <Link href={`${baseUrl}?page=${currentPage + 1}`}>
                        NEXT
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                ) : (
                    <span className="flex items-center">
                        NEXT
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                )}
            </Button>
        </div>
    );
}