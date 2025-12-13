"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncHtbMachines } from "./actions";
import { useRouter } from "next/navigation";

export default function SyncHtbButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        if (loading) return;

        // confirm dialog
        if (
            !confirm(
                "This will fetch all active machines from HackTheBox API and update the database. Continue?",
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            const result = await syncHtbMachines();
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
            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-mono"
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
