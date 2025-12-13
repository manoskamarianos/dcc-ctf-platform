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
import { Server, Plus, Monitor, Terminal } from "lucide-react";
import AdminMachineActions from "./admin-machine-actions";
import SyncHtbButton from "./sync-htb-button";
import PurgeMachinesButton from "./purge-htb-button"; // <--- Import here

export default async function AdminMachines() {
    const supabase = await createClient();

    // Fetch machines ordered by creation date
    const { data: machines, error } = await supabase
        .from("machines")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="text-red-500">
                Error loading machines: {error.message}
            </div>
        );
    }

    const getOsIcon = (os: string) => {
        const normalized = os.toLowerCase();
        if (normalized.includes("windows"))
            return <Monitor className="w-4 h-4 text-blue-400" />;
        return <Terminal className="w-4 h-4 text-orange-400" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                        SYSTEM_INVENTORY
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage local simulation boxes and remote HTB instances.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Purge Button */}
                    <PurgeMachinesButton />

                    {/* Sync Button */}
                    <SyncHtbButton />

                    <Button
                        asChild
                        className="bg-terminal-green text-black hover:bg-terminal-green/80 font-mono font-bold"
                    >
                        <Link href="/admin/machines/create">
                            <Plus className="mr-2 h-4 w-4" />
                            NEW_LOCAL_MACHINE
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-purple-500" />
                        Machine Database
                    </CardTitle>
                    <CardDescription>
                        List of all registered target systems
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400">
                                    Machine Name
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    OS
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Source
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
                            {machines?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No machines found. Sync from HTB or
                                        create a local one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {machines?.map((machine) => (
                                <TableRow
                                    key={machine.id}
                                    className="border-gray-800 hover:bg-white/5"
                                >
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            {machine.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            {getOsIcon(machine.os)}
                                            {machine.os}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {machine.htb_id ? (
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-900/20 text-blue-400 border-blue-900/50"
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
                                        <span className="text-gray-300 text-sm">
                                            {machine.difficulty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-terminal-green">
                                        {machine.points}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {machine.is_active ? (
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
                                        <AdminMachineActions
                                            machineId={machine.id}
                                            isActive={machine.is_active}
                                            title={machine.title}
                                            isHtb={!!machine.htb_id}
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
