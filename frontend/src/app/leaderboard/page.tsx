// frontend/src/app/leaderboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Terminal, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const supabase = await createClient();

    // Assumption: You have a view or logic to get this data. 
    // If you haven't created the view yet, this might return null/error, 
    // but the UI will handle the empty state.
    const { data: leaderboard } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(50);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="h-6 w-6 text-yellow-400 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
        if (index === 1) return <Medal className="h-6 w-6 text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]" />;
        if (index === 2) return <Medal className="h-6 w-6 text-amber-700 drop-shadow-[0_0_5px_rgba(180,83,9,0.5)]" />;
        return <span className="font-mono text-gray-600 text-lg">#{index + 1}</span>;
    };

    const getRankRowStyle = (index: number) => {
        if (index === 0) return "bg-yellow-900/10 hover:bg-yellow-900/20 border-l-2 border-l-yellow-500";
        if (index === 1) return "bg-gray-900/10 hover:bg-gray-900/20 border-l-2 border-l-gray-400";
        if (index === 2) return "bg-orange-900/10 hover:bg-orange-900/20 border-l-2 border-l-amber-700";
        return "hover:bg-terminal-green/5 border-l-2 border-l-transparent hover:border-l-terminal-green transition-all";
    };

    return (
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 rounded-sm border border-yellow-500/30">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl turret-extrabold text-white tracking-tight uppercase">
                                Global_Rankings
                            </h1>
                            <p className="text-gray-500 turret-light text-sm">
                                ELITE_OPERATIVE_DATABASE // SORT_BY: SCORE_DESC
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded border border-gray-800">
                        <Activity className="h-4 w-4 text-terminal-green animate-pulse" />
                        <span className="font-mono text-xs text-gray-400">LIVE_FEED</span>
                    </div>
                </div>

                <Card className="bg-black/60 backdrop-blur-sm border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <CardHeader className="border-b border-gray-800 pb-4">
                        <CardTitle className="text-gray-400 turret-medium text-sm uppercase flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Top 50 Operatives
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-800 hover:bg-transparent">
                                    <TableHead className="w-[100px] text-terminal-green turret-bold uppercase tracking-wider pl-6">
                                        Rank
                                    </TableHead>
                                    <TableHead className="text-terminal-green turret-bold uppercase tracking-wider">
                                        Operative_ID
                                    </TableHead>
                                    <TableHead className="text-right text-terminal-green turret-bold uppercase tracking-wider">
                                        Captures
                                    </TableHead>
                                    <TableHead className="text-right text-terminal-green turret-bold uppercase tracking-wider pr-6">
                                        Score
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Empty State Handling */}
                                {(!leaderboard || leaderboard.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-mono">
                                            // DATABASE_CONNECTION_PENDING...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {leaderboard?.map((user, index) => (
                                    <TableRow
                                        key={user.username || index}
                                        className={`border-b border-gray-900/50 ${getRankRowStyle(index)}`}
                                    >
                                        <TableCell className="font-medium pl-6 py-4">
                                            <div className="flex items-center">
                                                {getRankIcon(index)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className={`turret-bold text-lg ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {user.username}
                                                </span>
                                                {index < 3 && (
                                                    <Badge variant="outline" className="w-fit mt-1 border-gray-800 text-[10px] text-gray-500 font-mono">
                                                        ELITE_TIER
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-400 font-mono text-lg">
                                            {user.solve_count || 0}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <span className="font-mono text-terminal-green text-xl font-bold tracking-tight">
                                                {user.total_points || 0}
                                            </span>
                                            <span className="text-xs text-gray-600 ml-1">PTS</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}