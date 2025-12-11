import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ChallengeForm from "@/app/admin/challenges/create/challenge-form";

// 1. Update the interface: params is now a Promise
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditChallengePage({ params }: PageProps) {
    // 2. Await the params to get the ID
    const { id } = await params;

    const supabase = await createClient();

    // 3. Verify Admin Access
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 4. Fetch the challenge data AND the related hints using the unwrapped 'id'
    const { data: challenge, error } = await supabase
        .from("challenges")
        .select("*, hints(*)")
        .eq("id", id) // Use the 'id' variable here
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
