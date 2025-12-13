import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengeGrid from "./challenge-grid";
import { generateUserFlag } from "@/lib/flag-generator";
import PaginationControls from "@/components/ui/pagination-controls";
import FilterBar from "@/components/ui/filter-bar";

export const dynamic = "force-dynamic";

interface ChallengesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChallengesPage({
    searchParams,
}: ChallengesPageProps) {
    const supabase = await createClient();

    // 0. Handle Params
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const difficultyFilter = resolvedSearchParams.difficulty as string;
    const categoryFilter = resolvedSearchParams.category as string;

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

    // 2. Check if User is Admin
    const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    const isAdmin = profile?.is_admin === true;

    // 3. Build Query with Filters
    let query = supabase
        .from("challenges")
        .select(`*, hints (content), solves (user_id)`, { count: "exact" })
        .eq("is_active", true);

    if (difficultyFilter) {
        // Case-insensitive match for robustness
        query = query.ilike("difficulty", difficultyFilter);
    }

    if (categoryFilter) {
        query = query.eq("category", categoryFilter);
    }

    // Execute Query
    const {
        data: challengesData,
        error,
        count,
    } = await query.order("points", { ascending: true }).range(from, to);

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
            htb_id: c.htb_id,
            solved: c.solves.some(
                (s: { user_id: string }) => s.user_id === user.id,
            ),
            hints: c.hints || [],
            debug_flag:
                (isAdmin || c.category === "Sanity Check") && !c.htb_id
                    ? generateUserFlag(c.flag_template, c.server_seed, user.id)
                    : null,
        })) || [];

    // Filter Options
    const filters = [
        {
            key: "category",
            label: "Category",
            options: [
                "Web",
                "Crypto",
                "Pwn",
                "Forensics",
                "Reverse",
                "Misc",
            ],
        },
        {
            key: "difficulty",
            label: "Difficulty",
            options: ["Easy", "Medium", "Hard", "Insane"],
        },
    ];

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">
                            Active_Operations
                        </h1>
                        <p className="text-gray-400 mt-2 turret-light">
                            Select a target to engage. Use intel drops if you hit
                            a firewall.
                        </p>
                    </div>

                    <FilterBar filters={filters} />
                </div>

                <ChallengeGrid challenges={challenges} />

                <PaginationControls
                    totalItems={count || 0}
                    itemsPerPage={ITEMS_PER_PAGE}
                    baseUrl="/challenges"
                />
            </div>
        </main>
    );
}