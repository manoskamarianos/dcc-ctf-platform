import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy, ArrowRight, Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Fetch active contests (we show ended ones too for history, but only if marked is_active by admin)
    const { data: contests, error } = await supabase
        .from("contests")
        .select("*")
        .eq("is_active", true)
        .order("start_time", { ascending: false });

    if (error) console.error("Error fetching contests:", error);

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate)
            return {
                label: "UPCOMING",
                color: "text-blue-400 border-blue-400/50 bg-blue-400/10",
                canEnter: false,
            };
        if (now > endDate)
            return {
                label: "ENDED",
                color: "text-gray-500 border-gray-600 bg-gray-500/10",
                canEnter: true, // Allow viewing past scoreboard/challenges (optional)
            };
        return {
            label: "LIVE NOW",
            color: "text-green-500 border-green-500 bg-green-500/10 animate-pulse",
            canEnter: true,
        };
    };

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-3">
                        <Swords className="h-8 w-8 text-purple-500" />
                        Competitive_Zones
                    </h1>
                    <p className="text-gray-400 mt-2 turret-light">
                        Engage in time-bound hacking campaigns.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests?.length === 0 && (
                        <div className="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-md">
                            <p className="text-gray-500 font-mono">
                                NO_EVENTS_SCHEDULED
                            </p>
                        </div>
                    )}

                    {contests?.map((contest) => {
                        const status = getStatus(
                            contest.start_time,
                            contest.end_time,
                        );

                        return (
                            <Card
                                key={contest.id}
                                className={`bg-gray-950/50 border backdrop-blur-sm transition-all duration-300 ${
                                    status.label === "LIVE NOW"
                                        ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                        : "border-gray-800 hover:border-gray-700"
                                }`}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge
                                            variant="outline"
                                            className={`font-mono text-[10px] tracking-wider ${status.color}`}
                                        >
                                            {status.label}
                                        </Badge>
                                        {status.label === "LIVE NOW" && (
                                            <Trophy className="h-5 w-5 text-yellow-500" />
                                        )}
                                    </div>
                                    <CardTitle className="text-white turret-bold text-xl">
                                        {contest.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px]">
                                        {contest.description}
                                    </p>
                                    <div className="space-y-2 font-mono text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                Start:{" "}
                                                {new Date(
                                                    contest.start_time,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                Ends:{" "}
                                                {new Date(
                                                    contest.end_time,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {status.canEnter ? (
                                        <Button
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold"
                                            asChild
                                        >
                                            <Link
                                                href={`/contests/${contest.id}`}
                                            >
                                                ENTER_LOBBY{" "}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled
                                            variant="secondary"
                                            className="w-full font-mono opacity-50 cursor-not-allowed"
                                        >
                                            LOCKED
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
