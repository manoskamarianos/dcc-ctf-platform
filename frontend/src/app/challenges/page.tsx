import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengeGrid from "./challenge-grid";
import { generateUserFlag } from "@/lib/flag-generator";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Check if User is Admin
    const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    const isAdmin = profile?.is_admin === true;

    // 3. Fetch Active Challenges
    // Added 'htb_id' to the selection
    const { data: challengesData, error } = await supabase
        .from("challenges")
        .select(`*, hints (content), solves (user_id)`)
        .eq("is_active", true)
        .order("points", { ascending: true });

    if (error) console.error("Error fetching challenges:", error);

    // 4. Transform data
    const challenges =
        challengesData?.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            points: c.points,
            description: c.description,
            file_url: c.file_url,
            htb_id: c.htb_id, // <--- Pass this to the grid
            solved: c.solves.some(
                (s: { user_id: string }) => s.user_id === user.id,
            ),
            hints: c.hints || [],

            // Only generate a local debug flag if it's NOT an HTB challenge
            // HTB challenges don't have local flags to generate.
            debug_flag:
                (isAdmin || c.category === "Sanity Check") && !c.htb_id
                    ? generateUserFlag(c.flag_template, c.server_seed, user.id)
                    : null,
        })) || [];

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">
                        Active_Operations
                    </h1>
                    <p className="text-gray-400 mt-2 turret-light">
                        Select a target to engage. Use intel drops if you hit a
                        firewall.
                    </p>
                </div>

                <ChallengeGrid challenges={challenges} />
            </div>
        </main>
    );
}
