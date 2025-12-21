"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterOption {
    key: string; // URL param key (e.g., 'difficulty')
    label: string; // Placeholder label (e.g., 'Difficulty')
    options: string[]; // Options (e.g., ['Easy', 'Medium'])
}

interface FilterBarProps {
    filters: FilterOption[];
}

export default function FilterBar({ filters }: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = (name: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        // Reset page to 1 whenever a filter changes to avoid empty pages
        params.set("page", "1");

        if (value && value !== "all") {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        return params.toString();
    };

    const handleFilterChange = (key: string, value: string) => {
        router.push(pathname + "?" + createQueryString(key, value));
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    // Check if any of our filter keys or search are currently active in the URL
    const hasActiveFilters = Array.from(searchParams.keys()).some(
        (key) => key !== "page" && (filters.some((f) => f.key === key) || key === "search"),
    );

    return (
        <div className="flex flex-wrap items-center gap-4">
            {filters.map((filter) => (
                <div key={filter.key} className="w-[180px]">
                    <Select
                        // Use key to force re-render when URL changes externally (e.g. clear button)
                        key={searchParams.get(filter.key) || "all"}
                        defaultValue={searchParams.get(filter.key) || "all"}
                        onValueChange={(val) =>
                            handleFilterChange(filter.key, val)
                        }
                    >
                        <SelectTrigger className="bg-gray-900 border-gray-800 text-white font-mono text-xs h-9">
                            <SelectValue
                                placeholder={`Filter by ${filter.label}`}
                            />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="all" className="font-mono text-xs">
                                All {filter.label}
                            </SelectItem>
                            {filter.options.map((opt) => (
                                <SelectItem
                                    key={opt}
                                    value={opt}
                                    className="font-mono text-xs"
                                >
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 font-mono text-xs h-9"
                >
                    <X className="w-3 h-3 mr-2" />
                    CLEAR_FILTERS
                </Button>
            )}
        </div>
    );
}