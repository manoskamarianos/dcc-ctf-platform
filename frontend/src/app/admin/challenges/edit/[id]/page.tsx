import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ChallengeForm from "@/app/admin/challenges/create/challenge-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function EditChallengePage({ params }: PageProps) {
    const supabase = await createClient();

    // 1. Verify Admin Access (Double check, though middleware/layout handles it)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 2. Fetch the challenge data
    const { data: challenge, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !challenge) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    EDIT_CHALLENGE
                </h1>
                <p className="text-gray-400 mt-2">
                    Modify existing challenge parameters.
                </p>
            </div>

            {/* Pass data to the reusable form with isEditMode=true */}
            <ChallengeForm challenge={challenge} isEditMode={true} />
        </div>
    );
}
