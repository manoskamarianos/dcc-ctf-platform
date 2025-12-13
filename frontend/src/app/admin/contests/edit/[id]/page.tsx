import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ContestForm from "../../contest-form";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditContestPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 1. Fetch data in parallel: Contest details, Available Challenges, Available Machines
    const [contestResult, challengesResult, machinesResult] = await Promise.all(
        [
            supabase
                .from("contests")
                .select("*, contest_items(challenge_id, machine_id)")
                .eq("id", id)
                .single(),
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
        ],
    );

    const contest = contestResult.data;
    const availableChallenges = challengesResult.data || [];
    const availableMachines = machinesResult.data || [];

    if (contestResult.error || !contest) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    EDIT_EVENT
                </h1>
                <p className="text-gray-400 mt-2">
                    Modify contest timeline and scope.
                </p>
            </div>

            <ContestForm
                contest={contest}
                availableChallenges={availableChallenges}
                availableMachines={availableMachines}
                isEditMode={true}
            />
        </div>
    );
}
