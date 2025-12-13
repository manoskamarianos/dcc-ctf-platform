import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MachineGrid from "./machine-grid";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Fetch Active Machines
    // We join on machine_solves to determine if the current user has solved them
    const { data: machinesData, error } = await supabase
        .from("machines")
        .select(`*, machine_solves (user_id)`)
        .eq("is_active", true)
        .order("points", { ascending: true });

    if (error) console.error("Error fetching machines:", error);

    // 3. Transform data
    const machines =
        machinesData?.map((m) => ({
            id: m.id,
            title: m.title,
            os: m.os,
            difficulty: m.difficulty,
            points: m.points,
            avatar_url: m.avatar_url,
            htb_id: m.htb_id,
            solved: m.machine_solves.some(
                (s: { user_id: string }) => s.user_id === user.id,
            ),
        })) || [];

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">
                        Active_Systems
                    </h1>
                    <p className="text-gray-400 mt-2 turret-light">
                        Select a target system to infiltrate. Target list
                        includes local simulations and live HackTheBox
                        instances.
                    </p>
                </div>

                <MachineGrid machines={machines} />
            </div>
        </main>
    );
}
