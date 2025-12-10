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
import { Trophy, Medal, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const supabase = await createClient();

    // Complex query: Join Users with Solves, Join Solves with Challenges
    // Note: Supabase JS doesn't do deep aggregates easily in one line without Views or RPC.
    // However, we can fetch raw data and aggregate in JS for small-medium scale,
    // OR create a View in SQL. Let's do a robust RPC approach for scalability.

    // BUT for simplicity in this Next.js setup, let's use a SQL View approach.
    // Assumption: You ran the SQL below.

    const { data: leaderboard, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(50);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
        if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
        if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
        return <span className="font-mono text-gray-500">#{index + 1}</span>;
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <h1 className="text-3xl font-bold font-mono text-white flex items-center gap-3">
                <Trophy className="text-yellow-500" />
                GLOBAL_RANKINGS
            </h1>

            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-400 font-mono text-sm uppercase">
                        Top Operatives
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="w-[100px] text-gray-500">
                                    Rank
                                </TableHead>
                                <TableHead className="text-gray-500">
                                    Operative
                                </TableHead>
                                <TableHead className="text-right text-gray-500">
                                    Solves
                                </TableHead>
                                <TableHead className="text-right text-terminal-green">
                                    Score
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard?.map((user, index) => (
                                <TableRow
                                    key={user.username}
                                    className="border-gray-800 hover:bg-white/5"
                                >
                                    <TableCell className="font-medium">
                                        <div className="pl-2">
                                            {getRankIcon(index)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-white font-bold">
                                        {user.username}
                                        {index < 3 && (
                                            <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                                                ELITE
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-400 font-mono">
                                        {user.solve_count}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-terminal-green text-lg">
                                        {user.total_points}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
