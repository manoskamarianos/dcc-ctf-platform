import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import MachineForm from "../../machine-form";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditMachinePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify Admin Access
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) redirect("/home");

    // 2. Fetch the machine data
    const { data: machine, error } = await supabase
        .from("machines")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !machine) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                    EDIT_MACHINE
                </h1>
                <p className="text-gray-400 mt-2">
                    Modify machine parameters or local flag data.
                </p>
            </div>

            <MachineForm machine={machine} isEditMode={true} />
        </div>
    );
}
