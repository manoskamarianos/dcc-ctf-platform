import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengeGrid from "./challenge-grid";
import { generateUserFlag } from "@/lib/flag-generator";
import PaginationControls from "@/components/ui/pagination-controls";
import FilterBar from "@/components/ui/filter-bar";
import SearchBar from "@/components/ui/search-bar";
import { isChallengeSolvedViaHtb, getUserActivity } from "@/lib/htb-client";

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

    // 2. Check if User is Admin and get HTB info
    const { data: profile } = await supabase
        .from("users")
        .select("is_admin, htb_id, htb_token")
        .eq("id", user.id)
        .single();

    const isAdmin = profile?.is_admin === true;
    const userHtbId = profile?.htb_id;
    const userHtbToken = profile?.htb_token || process.env.HTB_SYSTEM_TOKEN;

    // 3. Fetch HTB activity first to determine which challenges user has solved
    let htbActivities: any[] = [];
    let solvedHtbChallengeIds: number[] = [];
    if (userHtbId && userHtbToken) {
        try {
            htbActivities = await getUserActivity(userHtbToken, userHtbId);
            solvedHtbChallengeIds = htbActivities
                .filter((activity) => activity.object_type === "challenge")
                .map((activity) => activity.id);
            console.log(`[DEBUG] Found ${solvedHtbChallengeIds.length} solved HTB challenges for user ${userHtbId}`);
        } catch (error) {
            console.error("Error fetching HTB activity:", error);
        }
    } else {
        console.log(`[DEBUG] No HTB credentials - htbId: ${userHtbId}, hasToken: ${!!userHtbToken}`);
    }

    // 4. Get locally solved challenge IDs
    const { data: localSolves } = await supabase
        .from("solves")
        .select("challenge_id")
        .eq("user_id", user.id);
    
    const solvedChallengeIds = new Set(
        (localSolves || []).map((s) => s.challenge_id)
    );

    // 5. Build queries for active challenges and solved challenges separately
    // Then combine them to show active challenges + solved inactive challenges
    
    // Query 1: Active challenges (without pagination limit - we'll paginate after combining)
    let activeQuery = supabase
        .from("challenges")
        .select(`*, hints (content), solves (user_id)`)
        .eq("is_active", true);

    if (difficultyFilter) {
        activeQuery = activeQuery.ilike("difficulty", difficultyFilter);
    }

    if (categoryFilter) {
        activeQuery = activeQuery.eq("category", categoryFilter);
    }

    // Query 2: Solved challenges (inactive ones that user has solved)
    // We need to fetch challenges that are either:
    // - Locally solved (by challenge id)
    // - HTB solved (by htb_id)
    // Since we can't easily OR these in one query, we'll fetch them separately
    
    const solvedQueries: Promise<any>[] = [];
    
    // Fetch locally solved inactive challenges
    if (solvedChallengeIds.size > 0) {
        let localSolvedQuery = supabase
            .from("challenges")
            .select(`*, hints (content), solves (user_id)`)
            .eq("is_active", false)
            .in("id", Array.from(solvedChallengeIds));
        
        if (difficultyFilter) {
            localSolvedQuery = localSolvedQuery.ilike("difficulty", difficultyFilter);
        }
        if (categoryFilter) {
            localSolvedQuery = localSolvedQuery.eq("category", categoryFilter);
        }
        
        solvedQueries.push(localSolvedQuery.order("points", { ascending: true }));
    }
    
    // Fetch HTB solved challenges (both active and inactive) - this is important!
    // We want to show all solved challenges, not just inactive ones
    if (solvedHtbChallengeIds.length > 0) {
        let htbSolvedQuery = supabase
            .from("challenges")
            .select(`*, hints (content), solves (user_id)`)
            .in("htb_id", solvedHtbChallengeIds);
        
        if (difficultyFilter) {
            htbSolvedQuery = htbSolvedQuery.ilike("difficulty", difficultyFilter);
        }
        if (categoryFilter) {
            htbSolvedQuery = htbSolvedQuery.eq("category", categoryFilter);
        }
        
        solvedQueries.push(htbSolvedQuery.order("points", { ascending: true }));
    }

    // Execute queries
    const queryResults = await Promise.all([
        activeQuery.order("points", { ascending: true }),
        ...solvedQueries,
    ]);

    if (queryResults[0].error) console.error("Error fetching active challenges:", queryResults[0].error);
    queryResults.slice(1).forEach((result, idx) => {
        if (result.error) console.error(`Error fetching solved challenges (query ${idx + 1}):`, result.error);
    });

    // Combine results and remove duplicates
    const activeChallenges = queryResults[0].data || [];
    const solvedInactiveChallenges = queryResults.slice(1).flatMap((result) => result.data || []);
    
    console.log(`[DEBUG] Active challenges fetched: ${activeChallenges.length}`);
    console.log(`[DEBUG] Solved challenges fetched: ${solvedInactiveChallenges.length}`);
    console.log(`[DEBUG] Solved HTB IDs we're looking for: ${solvedHtbChallengeIds.length}`);
    
    // Create a map to avoid duplicates (in case a challenge is both active and solved)
    const challengeMap = new Map();
    [...activeChallenges, ...solvedInactiveChallenges].forEach((c) => {
        if (!challengeMap.has(c.id)) {
            challengeMap.set(c.id, c);
        }
    });

    // Convert to array and sort
    let allChallenges = Array.from(challengeMap.values());
    allChallenges.sort((a, b) => a.points - b.points);
    
    console.log(`[DEBUG] Total unique challenges after combining: ${allChallenges.length}`);

    // Apply search filter before pagination (if specified)
    if (searchQuery) {
        allChallenges = allChallenges.filter((c) =>
            c.title.toLowerCase().includes(searchQuery)
        );
    }

    // Apply pagination manually
    const totalCount = allChallenges.length;
    const challengesData = allChallenges.slice(from, to + 1);

    // 5. Transform data and check HTB activity for solved status
    const challenges = (challengesData || []).map((c) => {
        const localSolved = c.solves.some(
            (s: { user_id: string }) => s.user_id === user.id,
        );
        
        // Check HTB activity if this is an HTB challenge
        // Important: Convert both to numbers for comparison (htb_id might be string or number)
        let htbSolved = false;
        if (c.htb_id && htbActivities.length > 0) {
            const challengeHtbId = Number(c.htb_id);
            htbSolved = htbActivities.some(
                (activity) =>
                    activity.object_type === "challenge" &&
                    Number(activity.id) === challengeHtbId
            );
        }
        
        const isSolved = localSolved || htbSolved;
        
        // Debug logging for challenges that should be solved but aren't
        if (c.htb_id && solvedHtbChallengeIds.includes(Number(c.htb_id)) && !isSolved) {
            console.log(`[DEBUG] Challenge "${c.title}" (htb_id: ${c.htb_id}, type: ${typeof c.htb_id}) should be solved but isn't!`);
            console.log(`[DEBUG]   - Local solved: ${localSolved}`);
            console.log(`[DEBUG]   - HTB solved: ${htbSolved}`);
            console.log(`[DEBUG]   - HTB ID in solved list: ${solvedHtbChallengeIds.includes(Number(c.htb_id))}`);
            const matchingActivity = htbActivities.find(
                (a) => a.object_type === "challenge" && Number(a.id) === Number(c.htb_id)
            );
            console.log(`[DEBUG]   - Matching activity:`, matchingActivity ? `Found (id: ${matchingActivity.id}, type: ${typeof matchingActivity.id})` : 'Not found');
        }
        
        return {
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            points: c.points,
            description: c.description,
            file_url: c.file_url,
            htb_id: c.htb_id,
            solved: isSolved,
            hints: c.hints || [],
            debug_flag:
                (isAdmin || c.category === "Sanity Check") && !c.htb_id
                    ? generateUserFlag(c.flag_template, c.server_seed, user.id)
                    : null,
        };
    });
    
    // Debug: Count solved challenges
    const solvedCount = challenges.filter((c) => c.solved).length;
    console.log(`[DEBUG] Total challenges loaded: ${challenges.length}, Solved: ${solvedCount}`);
    console.log(`[DEBUG] Challenges with HTB IDs in solved list: ${challenges.filter((c) => c.htb_id && solvedHtbChallengeIds.includes(Number(c.htb_id))).length}`);

    // 6. Apply solved filter if specified
    let filteredChallenges = challenges;
    if (solvedFilter === "Solved") {
        filteredChallenges = challenges.filter((c) => c.solved === true);
    } else if (solvedFilter === "Unsolved") {
        filteredChallenges = challenges.filter((c) => c.solved === false);
    }

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
                                Active_Operations
                            </h1>
                            <p className="text-gray-400 mt-2 turret-light">
                                Select a target to engage. Use intel drops if you hit
                                a firewall.
                            </p>
                        </div>

                        <FilterBar filters={filters} />
                    </div>
                    
                    <SearchBar placeholder="Search challenges by name..." />
                </div>

                <ChallengeGrid challenges={filteredChallenges} />

                <PaginationControls
                    totalItems={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                    baseUrl="/challenges"
                />
            </div>
        </main>
    );
}