"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { purgeAllChallenges } from "./actions";
import { useRouter } from "next/navigation";

export default function PurgeChallengesButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePurge = async () => {
        if (loading) return;

        // Level 1 Confirmation
        if (
            !confirm(
                "DANGER ZONE: Are you sure you want to delete ALL challenges from the database?",
            )
        ) {
            return;
        }

        // Level 2 Confirmation
        if (
            !confirm(
                "FINAL WARNING: This will delete all challenges AND remove all associated user solves/scores. This action cannot be undone. Click OK to execute.",
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            const result = await purgeAllChallenges();
            if (result.error) {
                alert(`Purge Failed: ${result.error}`);
            } else {
                alert(result.message || "Database purged successfully.");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred during purge.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handlePurge}
            disabled={loading}
            className="bg-red-950/50 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white font-mono"
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="mr-2 h-4 w-4" />
            )}
            PURGE_DB
        </Button>
    );
}