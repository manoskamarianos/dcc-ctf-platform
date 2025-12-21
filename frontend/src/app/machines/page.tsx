import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MachineGrid from "./machine-grid";
import PaginationControls from "@/components/ui/pagination-controls";
import FilterBar from "@/components/ui/filter-bar";
import SearchBar from "@/components/ui/search-bar";
import { getUserActivity } from "@/lib/htb-client";

export const dynamic = "force-dynamic";

interface MachinesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MachinesPage({
    searchParams,
}: MachinesPageProps) {
    const supabase = await createClient();

    // 0. Handle Params
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const difficultyFilter = resolvedSearchParams.difficulty as string;
    const osFilter = resolvedSearchParams.os as string;
    const solvedFilter = resolvedSearchParams.solved as string;
    const searchQuery = (resolvedSearchParams.search as string)?.toLowerCase() || "";

    const ITEMS_PER_PAGE = 16;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user HTB info for activity checking
    const { data: profile } = await supabase
        .from("users")
        .select("htb_id, htb_token")
        .eq("id", user.id)
        .single();

    const userHtbId = profile?.htb_id;
    const userHtbToken = profile?.htb_token || process.env.HTB_SYSTEM_TOKEN;

    // 2. Build Query with Filters
    let query = supabase
        .from("machines")
        .select(`*, machine_solves (user_id)`, { count: "exact" })
        .eq("is_active", true);

    if (difficultyFilter) {
        query = query.ilike("difficulty", difficultyFilter);
    }

    if (osFilter) {
        // ilike handles potential case mismatches (e.g. "linux" vs "Linux")
        query = query.ilike("os", osFilter);
    }

    // Execute Query
    const {
        data: machinesData,
        error,
        count,
    } = await query.order("points", { ascending: true }).range(from, to);

    if (error) console.error("Error fetching machines:", error);

    // 3. Fetch HTB activity once if user has HTB credentials
    let htbActivities: any[] = [];
    if (userHtbId && userHtbToken) {
        try {
            htbActivities = await getUserActivity(userHtbToken, userHtbId);
        } catch (error) {
            console.error("Error fetching HTB activity:", error);
        }
    }

    // 4. Transform data and check HTB activity for solved status
    const machines = (machinesData || []).map((m) => {
        const localSolved = m.machine_solves.some(
            (s: { user_id: string }) => s.user_id === user.id,
        );
        
        // Check HTB activity if this is an HTB machine (only root flags count as solved)
        let htbSolved = false;
        if (m.htb_id && htbActivities.length > 0) {
            htbSolved = htbActivities.some(
                (activity) =>
                    activity.object_type === "machine" &&
                    activity.id === m.htb_id &&
                    activity.type === "root"
            );
        }
        
        return {
            id: m.id,
            title: m.title,
            os: m.os,
            difficulty: m.difficulty,
            points: m.points,
            avatar_url: m.avatar_url,
            htb_id: m.htb_id,
            solved: localSolved || htbSolved,
        };
    });

    // 5. Apply solved filter if specified
    let filteredMachines = machines;
    if (solvedFilter === "Solved") {
        filteredMachines = machines.filter((m) => m.solved === true);
    } else if (solvedFilter === "Unsolved") {
        filteredMachines = machines.filter((m) => m.solved === false);
    }

    // 6. Apply search filter if specified
    if (searchQuery) {
        filteredMachines = filteredMachines.filter((m) =>
            m.title.toLowerCase().includes(searchQuery)
        );
    }

    // Filter Options
    const filters = [
        {
            key: "os",
            label: "OS",
            options: ["Linux", "Windows", "Android", "Other"],
        },
        {
            key: "difficulty",
            label: "Difficulty",
            options: ["Easy", "Medium", "Hard", "Insane"],
        },
        {
            key: "solved",
            label: "Status",
            options: ["Solved", "Unsolved"],
        },
    ];

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

                        <FilterBar filters={filters} />
                    </div>
                    
                    <SearchBar placeholder="Search machines by name..." />
                </div>

                <MachineGrid machines={filteredMachines} />

                <PaginationControls
                    totalItems={filteredMachines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    baseUrl="/machines"
                />
            </div>
        </main>
    );
}