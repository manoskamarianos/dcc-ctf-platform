import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Terminal, Shield, Calendar, Trophy, Target } from "lucide-react";
import ProfileForm from "./profile-form";

export default async function Profile() {
    const supabase = await createClient();

    // 1. Get the authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Get the profile data from the 'users' table
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    // Date formatting
    const joinDate = new Date(
        profile?.created_at || new Date(),
    ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-terminal-green/10 rounded-full">
                    <Terminal className="h-6 w-6 text-terminal-green" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    OPERATOR_PROFILE
                </h1>
            </div>

            <Separator className="bg-gray-800" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Identity Card (Server Component) */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-terminal-green/50 bg-black shadow-[0_0_15px_rgba(0,255,0,0.05)]">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-terminal-green mb-4 relative">
                                <User className="h-12 w-12 text-terminal-green" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                            </div>
                            <CardTitle className="text-2xl font-mono text-terminal-green">
                                {profile?.username || "Unknown"}
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                                UID: {user.id.slice(0, 8)}...
                            </CardDescription>
                            <div className="mt-2">
                                <Badge
                                    variant="outline"
                                    className="border-terminal-green text-terminal-green bg-terminal-green/10"
                                >
                                    {profile?.is_admin
                                        ? "ADMINISTRATOR"
                                        : "OPERATIVE"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Joined
                                </span>
                                <span className="font-mono">{joinDate}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Status
                                </span>
                                <span className="text-green-500 font-mono">
                                    Active
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats (Mocked) */}
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardContent className="p-4 grid grid-cols-2 gap-4">
                            <div className="text-center p-2 bg-black rounded border border-gray-800">
                                <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
                                <div className="text-xl font-bold font-mono">
                                    0
                                </div>
                                <div className="text-xs text-gray-500">
                                    Points
                                </div>
                            </div>
                            <div className="text-center p-2 bg-black rounded border border-gray-800">
                                <Target className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                                <div className="text-xl font-bold font-mono">
                                    0
                                </div>
                                <div className="text-xs text-gray-500">
                                    Solves
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Form (Client Component) */}
                <div className="md:col-span-2">
                    <ProfileForm user={user} profile={profile} />
                </div>
            </div>
        </div>
    );
}
