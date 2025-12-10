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
import { Trophy, Plus, CalendarClock } from "lucide-react";
import ContestActions from "./contest-actions";

export default async function AdminContests() {
    const supabase = await createClient();

    const { data: contests, error } = await supabase
        .from("contests")
        .select("*")
        .order("start_time", { ascending: false });

    if (error) {
        return (
            <div className="text-red-500">
                Error loading contests: {error.message}
            </div>
        );
    }

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate)
            return {
                label: "Upcoming",
                color: "text-blue-400 border-blue-400/50",
            };
        if (now > endDate)
            return { label: "Ended", color: "text-gray-500 border-gray-600" };
        return {
            label: "Live",
            color: "text-green-500 border-green-500 animate-pulse",
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                        CONTEST_LOGS
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage scheduled capture-the-flag events.
                    </p>
                </div>
                <Button
                    asChild
                    className="bg-purple-600 text-white hover:bg-purple-700 font-mono font-bold"
                >
                    <Link href="/admin/contests/create">
                        <Plus className="mr-2 h-4 w-4" />
                        NEW_EVENT
                    </Link>
                </Button>
            </div>

            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Events Timeline
                    </CardTitle>
                    <CardDescription>
                        Overview of past, present, and future contests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400">
                                    Event Name
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Start Time
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Duration
                                </TableHead>
                                <TableHead className="text-center text-gray-400">
                                    Status
                                </TableHead>
                                <TableHead className="text-right text-gray-400">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contests?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No contests scheduled.
                                    </TableCell>
                                </TableRow>
                            )}
                            {contests?.map((contest) => {
                                const status = getStatus(
                                    contest.start_time,
                                    contest.end_time,
                                );
                                const durationHrs = Math.round(
                                    (new Date(contest.end_time).getTime() -
                                        new Date(
                                            contest.start_time,
                                        ).getTime()) /
                                        3600000,
                                );

                                return (
                                    <TableRow
                                        key={contest.id}
                                        className="border-gray-800 hover:bg-white/5"
                                    >
                                        <TableCell className="font-medium text-white">
                                            {contest.title}
                                        </TableCell>
                                        <TableCell className="text-gray-400 font-mono text-sm">
                                            <div className="flex items-center gap-2">
                                                <CalendarClock className="h-4 w-4" />
                                                {new Date(
                                                    contest.start_time,
                                                ).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {durationHrs} Hours
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={`${status.color} bg-transparent`}
                                            >
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ContestActions
                                                contestId={contest.id}
                                                title={contest.title}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
