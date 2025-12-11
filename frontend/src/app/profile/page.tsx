import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Terminal,
    Shield,
    Calendar,
    Trophy,
    Target,
    Hash,
} from "lucide-react";
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

    // 2. Get the profile data
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
        <main className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-terminal-green/10 rounded-sm border border-terminal-green/30">
                            <Terminal className="h-6 w-6 text-terminal-green" />
                        </div>
                        <div>
                            <h1 className="text-3xl turret-extrabold text-white tracking-tight uppercase">
                                Operative_Dossier
                            </h1>
                            <p className="text-gray-500 turret-light text-sm">
                                PERSONNEL_FILE // UID:{" "}
                                {user.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Identity Card */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-black/60 backdrop-blur-sm border border-terminal-green/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] overflow-hidden relative">
                            {/* Scanning line animation effect could go here */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terminal-green to-transparent opacity-50"></div>

                            <CardHeader className="text-center pt-8">
                                <div className="mx-auto w-32 h-32 bg-gray-950 rounded-full flex items-center justify-center border-2 border-terminal-green/50 mb-4 relative group">
                                    <User className="h-16 w-16 text-terminal-green group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 rounded-full border border-terminal-green/20 animate-ping opacity-20"></div>
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-black"></div>
                                </div>
                                <CardTitle className="text-2xl turret-bold text-white tracking-wider">
                                    {profile?.username || "Unknown_Agent"}
                                </CardTitle>
                                <div className="flex justify-center mt-3">
                                    {profile?.is_admin ? (
                                        <Badge className="bg-red-900/30 text-red-400 border-red-500/50 hover:bg-red-900/50 turret-medium tracking-widest px-4 py-1">
                                            <Shield className="w-3 h-3 mr-2" />{" "}
                                            ADMINISTRATOR
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-terminal-green/10 text-terminal-green border-terminal-green/30 hover:bg-terminal-green/20 turret-medium tracking-widest px-4 py-1">
                                            <Shield className="w-3 h-3 mr-2" />{" "}
                                            OPERATIVE
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pb-8">
                                <div className="space-y-4 pt-4 border-t border-gray-800 border-dashed">
                                    <div className="flex items-center justify-between text-sm group">
                                        <span className="text-gray-500 turret-light flex items-center gap-2 group-hover:text-terminal-green transition-colors">
                                            <Calendar className="h-4 w-4" />{" "}
                                            RECRUITED
                                        </span>
                                        <span className="font-mono text-gray-300">
                                            {joinDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm group">
                                        <span className="text-gray-500 turret-light flex items-center gap-2 group-hover:text-terminal-green transition-colors">
                                            <Hash className="h-4 w-4" />{" "}
                                            HTB_LINK
                                        </span>
                                        <span className="font-mono text-gray-300">
                                            {profile?.htb_id
                                                ? "CONNECTED"
                                                : "UNLINKED"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-black/40 border border-gray-800 hover:border-yellow-500/50 transition-colors group">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <Trophy className="h-6 w-6 text-gray-600 group-hover:text-yellow-500 mb-2 transition-colors" />
                                    <div className="text-2xl font-mono text-white font-bold">
                                        0
                                    </div>
                                    <div className="text-xs text-gray-500 turret-medium uppercase">
                                        Total Score
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/40 border border-gray-800 hover:border-blue-500/50 transition-colors group">
                                <CardContent className="p-4 flex flex-col items-center justify-center">
                                    <Target className="h-6 w-6 text-gray-600 group-hover:text-blue-500 mb-2 transition-colors" />
                                    <div className="text-2xl font-mono text-white font-bold">
                                        0
                                    </div>
                                    <div className="text-xs text-gray-500 turret-medium uppercase">
                                        Flags Captured
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="md:col-span-2">
                        <ProfileForm user={user} profile={profile} />
                    </div>
                </div>
            </div>
        </main>
    );
}
