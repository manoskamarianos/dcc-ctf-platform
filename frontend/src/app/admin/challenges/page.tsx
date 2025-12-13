import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Plus, FileCode, Layers } from "lucide-react";
import ChallengeActions from "./challenge-actions";
import SyncChallengesButton from "./sync-challenges-button";
import PurgeChallengesButton from "./purge-challenges-button"; // <--- Import this

export default async function AdminChallenges() {
    const supabase = await createClient();

    // Fetch challenges ordered by creation date
    const { data: challenges, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="text-red-500">
                Error loading challenges: {error.message}
            </div>
        );
    }

    // Helper for difficulty colors
    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy":
                return "text-green-400 border-green-500/30 bg-green-500/10";
            case "medium":
                return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
            case "hard":
                return "text-orange-400 border-orange-500/30 bg-orange-500/10";
            case "insane":
                return "text-red-500 border-red-600/30 bg-red-600/10";
            default:
                return "text-gray-400 border-gray-500/30";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                        CHALLENGE_ARCHIVE
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Deploy and manage capture-the-flag tasks.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Purge Button (Left) */}
                    <PurgeChallengesButton />

                    {/* Sync Button */}
                    <SyncChallengesButton />

                    <Button
                        asChild
                        className="bg-terminal-green text-black hover:bg-terminal-green/80 font-mono font-bold"
                    >
                        <Link href="/admin/challenges/create">
                            <Plus className="mr-2 h-4 w-4" />
                            NEW_LOCAL
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="bg-gray-950 border-gray-800">
                {/* ... rest of the file remains the same ... */}
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-500" />
                        Active Deployments
                    </CardTitle>
                    <CardDescription>
                        List of all configured challenges
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400">
                                    Title
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Source
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Category
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Difficulty
                                </TableHead>
                                <TableHead className="text-gray-400 text-right">
                                    Points
                                </TableHead>
                                <TableHead className="text-gray-400 text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-right text-gray-400">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {challenges?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No challenges found. Sync from HTB or
                                        create a local one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {challenges?.map((challenge) => (
                                <TableRow
                                    key={challenge.id}
                                    className="border-gray-800 hover:bg-white/5"
                                >
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <FileCode className="h-4 w-4 text-gray-500" />
                                            {challenge.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {challenge.htb_id ? (
                                            <Badge
                                                variant="secondary"
                                                className="bg-purple-900/20 text-purple-400 border-purple-900/50"
                                            >
                                                HTB
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-800 text-gray-300"
                                            >
                                                LOCAL
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-700 text-gray-300"
                                        >
                                            {challenge.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getDifficultyColor(
                                                challenge.difficulty,
                                            )}
                                        >
                                            {challenge.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-terminal-green">
                                        {challenge.points}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {challenge.is_active ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 ring-1 ring-inset ring-green-500/20">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 ring-1 ring-inset ring-gray-500/20">
                                                Hidden
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ChallengeActions
                                            challengeId={challenge.id}
                                            isActive={challenge.is_active}
                                            title={challenge.title}
                                        />
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
