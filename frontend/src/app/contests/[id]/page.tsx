import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Flag, Server, AlertTriangle } from "lucide-react";
import ChallengeGrid from "@/app/challenges/challenge-grid";
import MachineGrid from "@/app/machines/machine-grid";
import { generateUserFlag } from "@/lib/flag-generator";

// --- Type Definitions to fix "implicit any" errors ---
interface Challenge {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
    description: string;
    file_url?: string | null;
    solved: boolean;
    hints: { content: string }[];
    debug_flag?: string | null;
    htb_id?: number | null;
}

interface Machine {
    id: string;
    title: string;
    os: string;
    difficulty: string;
    points: number;
    avatar_url?: string | null;
    htb_id?: number | null;
    solved: boolean;
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ContestLobbyPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 1. Fetch Contest Details
    const { data: contest, error: contestError } = await supabase
        .from("contests")
        .select("*")
        .eq("id", id)
        .single();

    if (contestError || !contest) return notFound();

    // 2. Check Timing
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);

    if (now < start) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <Clock className="h-16 w-16 text-blue-500 mb-4 animate-pulse" />
                <h1 className="text-3xl text-white font-mono font-bold">
                    EVENT_LOCKED
                </h1>
                <p className="text-gray-400 mt-2 max-w-md">
                    This contest has not started yet. Please standby.
                </p>
                <div className="mt-6 bg-gray-900 border border-gray-800 p-4 rounded-md">
                    <p className="text-sm text-gray-500 font-mono uppercase">
                        Launch Time
                    </p>
                    <p className="text-xl text-white font-mono">
                        {start.toLocaleString()}
                    </p>
                </div>
            </div>
        );
    }

    // 3. Fetch Linked Items (Challenges & Machines)
    const { data: items } = await supabase
        .from("contest_items")
        .select("challenge_id, machine_id")
        .eq("contest_id", id);

    const challengeIds = items
        ?.filter((i) => i.challenge_id)
        .map((i) => i.challenge_id) as string[];
    const machineIds = items
        ?.filter((i) => i.machine_id)
        .map((i) => i.machine_id) as string[];

    // 4. Fetch the actual content data + User Solves

    // A. Challenges
    // Initialize with explicit type to fix TS error
    let challenges: Challenge[] = [];

    if (challengeIds.length > 0) {
        const { data: chData } = await supabase
            .from("challenges")
            .select("*, hints(content), solves(user_id)")
            .in("id", challengeIds)
            .eq("is_active", true);

        // Check admin status for flag generation
        const { data: profile } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", user.id)
            .single();
        const isAdmin = profile?.is_admin === true;

        challenges =
            chData?.map((c) => ({
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
                        ? generateUserFlag(
                              c.flag_template,
                              c.server_seed,
                              user.id,
                          )
                        : null,
            })) || [];
    }

    // B. Machines
    // Initialize with explicit type to fix TS error
    let machines: Machine[] = [];

    if (machineIds.length > 0) {
        const { data: macData } = await supabase
            .from("machines")
            .select("*, machine_solves(user_id)")
            .in("id", machineIds)
            .eq("is_active", true);

        machines =
            macData?.map((m) => ({
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
    }

    const isEnded = now > end;

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
                {/* Contest Header */}
                <div className="border-b border-purple-900/30 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">
                                    {contest.title}
                                </h1>
                                {isEnded ? (
                                    <Badge
                                        variant="outline"
                                        className="text-gray-500 border-gray-600"
                                    >
                                        ENDED
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-green-500 border-green-500 animate-pulse bg-green-500/10"
                                    >
                                        LIVE
                                    </Badge>
                                )}
                            </div>
                            <p className="text-gray-400 max-w-2xl">
                                {contest.description}
                            </p>
                        </div>

                        {/* Timer / Date Display */}
                        <div className="flex flex-col gap-2 text-right">
                            <div className="bg-gray-950 border border-gray-800 px-4 py-2 rounded">
                                <div className="text-xs text-gray-500 font-mono uppercase mb-1">
                                    Time Remaining
                                </div>
                                <div className="text-xl font-mono text-white font-bold">
                                    {isEnded ? (
                                        "00:00:00"
                                    ) : (
                                        <span className="text-purple-400">
                                            Until{" "}
                                            {end.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isEnded && (
                    <div className="bg-yellow-900/10 border border-yellow-900/50 p-4 rounded flex items-center gap-3 text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm">
                            This contest has concluded. Submissions may be
                            recorded but will not affect the contest scoreboard.
                        </p>
                    </div>
                )}

                {/* Machines Section */}
                {machines.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl text-white font-mono flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-500" />
                            Target Machines
                        </h2>
                        <MachineGrid machines={machines} />
                    </div>
                )}

                {/* Challenges Section */}
                {challenges.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl text-white font-mono flex items-center gap-2">
                            <Flag className="h-5 w-5 text-terminal-green" />
                            Capture The Flag Tasks
                        </h2>
                        <ChallengeGrid challenges={challenges} />
                    </div>
                )}

                {machines.length === 0 && challenges.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>No content assigned to this contest.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
