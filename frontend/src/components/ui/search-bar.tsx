"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
    placeholder?: string;
}

export default function SearchBar({ placeholder = "Search..." }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    
    // Initialize with empty string to avoid hydration mismatch
    // Then sync from URL params after mount
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        setMounted(true);
        // Sync with URL params after component mounts (client-side only)
        setSearchValue(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        const params = new URLSearchParams(searchParams.toString());
        
        // Reset page to 1 when search changes
        params.set("page", "1");
        
        if (value.trim()) {
            params.set("search", value.trim());
        } else {
            params.delete("search");
        }
        
        router.push(pathname + "?" + params.toString());
    };

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                type="text"
                placeholder={placeholder}
                value={mounted ? searchValue : ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-800 text-white font-mono text-sm focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-gray-700"
                suppressHydrationWarning
            />
        </div>
    );
}

