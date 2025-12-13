import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Flag,
    Target,
    Trophy,
    Activity,
    Server,
    Cpu,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch all counts in parallel for performance
    const [
        { count: userCount },
        { count: challengeCount },
        { count: machineCount },
        { count: challengeSolves },
        { count: machineSolves },
        { count: contestCount },
        { data: recentUsers },
    ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("challenges").select("*", { count: "exact", head: true }),
        supabase.from("machines").select("*", { count: "exact", head: true }), // <--- New
        supabase.from("solves").select("*", { count: "exact", head: true }),
        supabase
            .from("machine_solves")
            .select("*", { count: "exact", head: true }), // <--- New
        supabase.from("contests").select("*", { count: "exact", head: true }),
        // Fetch last 5 users
        supabase
            .from("users")
            .select("username, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    const totalSolves = (challengeSolves || 0) + (machineSolves || 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
                    <Activity className="text-green-500" />
                    SYSTEM_OVERVIEW
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded border border-gray-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    SYSTEM_ONLINE
                </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* User Count */}
                <Card className="bg-gray-950 border-gray-800 shadow-sm hover:border-blue-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 font-mono">
                            OPERATIVES
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white font-mono">
                            {userCount || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Registered Users
                        </p>
                    </CardContent>
                </Card>

                {/* Challenges & Machines Count */}
                <Card className="bg-gray-950 border-gray-800 shadow-sm hover:border-terminal-green/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 font-mono">
                            INFRASTRUCTURE
                        </CardTitle>
                        <Server className="h-4 w-4 text-terminal-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-white font-mono">
                                {challengeCount || 0}
                            </div>
                            <span className="text-xs text-gray-500">
                                Challs
                            </span>
                            <span className="text-gray-700">/</span>
                            <div className="text-2xl font-bold text-white font-mono">
                                {machineCount || 0}
                            </div>
                            <span className="text-xs text-gray-500">
                                Machines
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Deployed Assets
                        </p>
                    </CardContent>
                </Card>

                {/* Total Solves */}
                <Card className="bg-gray-950 border-gray-800 shadow-sm hover:border-yellow-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 font-mono">
                            TOTAL_PWNS
                        </CardTitle>
                        <Target className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white font-mono">
                            {totalSolves}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Flags Captured (All Types)
                        </p>
                    </CardContent>
                </Card>

                {/* Contests Count */}
                <Card className="bg-gray-950 border-gray-800 shadow-sm hover:border-purple-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 font-mono">
                            CAMPAIGNS
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white font-mono">
                            {contestCount || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Scheduled Events
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Row: Server Info & Recent Users */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gray-950 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono text-lg">
                            <Cpu className="h-5 w-5 text-gray-400" />
                            SERVER_STATUS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-gray-900 pb-2">
                            <span className="text-gray-400">
                                Database Status
                            </span>
                            <span className="text-green-500 font-mono">
                                CONNECTED
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-900 pb-2">
                            <span className="text-gray-400">Environment</span>
                            <span className="text-white font-mono capitalize">
                                {process.env.NODE_ENV}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">HTB Sync</span>
                            <span
                                className={
                                    process.env.HTB_SYSTEM_TOKEN
                                        ? "text-green-400 font-mono"
                                        : "text-red-400 font-mono"
                                }
                            >
                                {process.env.HTB_SYSTEM_TOKEN
                                    ? "CONFIGURED"
                                    : "TOKEN_MISSING"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-950 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono text-lg">
                            <Users className="h-5 w-5 text-gray-400" />
                            RECENT_RECRUITS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers?.map((u) => (
                                <div
                                    key={u.username}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="font-mono text-sm text-gray-300">
                                            {u.username}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono">
                                        {new Date(
                                            u.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {(!recentUsers || recentUsers.length === 0) && (
                                <p className="text-gray-500 text-sm">
                                    No recent activity.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
