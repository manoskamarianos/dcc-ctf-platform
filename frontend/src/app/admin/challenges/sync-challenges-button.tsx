"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncHtbChallenges } from "./actions";
import { useRouter } from "next/navigation";

export default function SyncChallengesButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        if (loading) return;

        if (
            !confirm(
                "This will fetch all active challenges from HackTheBox API and update the database. Continue?",
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            const result = await syncHtbChallenges();
            if (result.error) {
                alert(`Sync Failed: ${result.error}`);
            } else {
                alert(result.message || "Sync complete!");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred during sync.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleSync}
            disabled={loading}
            className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-mono"
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
            )}
            SYNC_HTB
        </Button>
    );
}
