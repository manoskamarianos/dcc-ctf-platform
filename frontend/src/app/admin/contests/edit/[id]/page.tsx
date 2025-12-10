import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ContestForm from "../../contest-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function EditContestPage({ params }: PageProps) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: contest, error } = await supabase
        .from("contests")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !contest) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    EDIT_EVENT
                </h1>
                <p className="text-gray-400 mt-2">
                    Modify contest timeline and details.
                </p>
            </div>

            <ContestForm contest={contest} isEditMode={true} />
        </div>
    );
}
