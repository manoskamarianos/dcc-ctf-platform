import { createClient } from "@/lib/supabase/server";
import ContestForm from "../contest-form";

export default async function CreateContestPage() {
    const supabase = await createClient();

    // Fetch available content for the contest scope selector
    const [challengesResult, machinesResult] = await Promise.all([
        supabase
            .from("challenges")
            .select("id, title, category, difficulty, points, is_active")
            .eq("is_active", true)
            .order("title"),
        supabase
            .from("machines")
            .select("id, title, os, difficulty, points, is_active")
            .eq("is_active", true)
            .order("title"),
    ]);

    const availableChallenges = challengesResult.data || [];
    const availableMachines = machinesResult.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    SCHEDULE_EVENT
                </h1>
                <p className="text-gray-400 mt-2">
                    Initialize a new competitive timeframe and define its scope.
                </p>
            </div>

            <ContestForm
                availableChallenges={availableChallenges}
                availableMachines={availableMachines}
            />
        </div>
    );
}
