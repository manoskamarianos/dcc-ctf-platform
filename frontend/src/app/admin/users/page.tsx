import { createClient } from "@/lib/supabase/server";
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
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import UserActions from "./user-actions";

export default async function AdminUsers() {
    const supabase = await createClient();

    // Fetch all users ordered by creation date
    const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="text-red-500">
                Error loading users: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
                        USER_DATABASE
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage operative permissions and access.
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="border-terminal-green text-terminal-green px-4 py-1"
                >
                    TOTAL: {users?.length || 0}
                </Badge>
            </div>

            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Registered Operatives
                    </CardTitle>
                    <CardDescription>
                        Full directory of platform users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400 w-[300px]">
                                    Identity
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Role
                                </TableHead>
                                <TableHead className="text-gray-400">
                                    Joined
                                </TableHead>
                                <TableHead className="text-right text-gray-400">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className="border-gray-800 hover:bg-white/5"
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-white font-bold text-base">
                                                {user.username}
                                            </span>
                                            <span className="font-mono text-xs text-gray-500">
                                                ID: {user.id}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_admin ? (
                                            <Badge className="bg-red-900/50 text-red-400 hover:bg-red-900/70 border-red-900 border">
                                                <Shield className="w-3 h-3 mr-1" />{" "}
                                                ADMIN
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-800 text-gray-300 hover:bg-gray-700"
                                            >
                                                USER
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-gray-400">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Client Component for Actions */}
                                        <UserActions
                                            userId={user.id}
                                            isAdmin={user.is_admin}
                                            username={user.username}
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
