"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { updateProfile } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Activity,
    User as UserIcon,
    Hash,
    Save,
    AlertCircle,
    CheckCircle,
    Settings,
    Key,
    Eye,
    EyeOff,
} from "lucide-react";

interface ProfileFormProps {
    user: User;
    profile: {
        username: string;
        htb_id: string | null;
        htb_token?: string | null; // <--- NEW field
    } | null;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [showToken, setShowToken] = useState(false); // <--- State to toggle visibility
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await updateProfile(formData);

        if (result?.error) {
            setMessage({ type: "error", text: result.error });
        } else if (result?.success) {
            setMessage({ type: "success", text: result.success });
        }

        setLoading(false);
    }

    return (
        <Card className="h-full bg-black/60 backdrop-blur-sm border border-gray-800">
            <CardHeader className="border-b border-gray-800 pb-6">
                <CardTitle className="flex items-center gap-2 text-xl turret-bold text-white">
                    <Settings className="h-5 w-5 text-terminal-green animate-spin-slow" />
                    System_Configuration
                </CardTitle>
                <CardDescription className="turret-light text-gray-400">
                    Update operative credentials and external linkages
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form action={handleSubmit} className="space-y-8">
                    {/* Email (Read Only) */}
                    <div className="space-y-3 opacity-60">
                        <Label
                            htmlFor="email"
                            className="turret-medium text-gray-400 uppercase text-xs tracking-widest"
                        >
                            Primary_Identity (Immutable)
                        </Label>
                        <Input
                            value={user.email}
                            disabled
                            className="bg-gray-900 border-gray-800 text-gray-500 font-mono cursor-not-allowed border-dashed"
                        />
                    </div>

                    {/* Username */}
                    <div className="space-y-3 group">
                        <Label
                            htmlFor="username"
                            className="turret-medium text-white uppercase text-xs tracking-widest group-focus-within:text-terminal-green transition-colors"
                        >
                            Alias / Display_Name
                        </Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                            <Input
                                id="username"
                                name="username"
                                defaultValue={profile?.username || ""}
                                placeholder="Update username"
                                className="pl-10 bg-gray-950/50 border-gray-800 text-white font-mono focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-gray-700 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 turret-light">
                            WARNING: Modifying alias may impact leaderboard
                            cache.
                        </p>
                    </div>

                    {/* HTB ID */}
                    <div className="space-y-3 group">
                        <Label
                            htmlFor="htb_id"
                            className="turret-medium text-white uppercase text-xs tracking-widest group-focus-within:text-terminal-green transition-colors"
                        >
                            HackTheBox User ID
                        </Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                            <Input
                                id="htb_id"
                                name="htb_id"
                                defaultValue={profile?.htb_id || ""}
                                placeholder="e.g. 123456"
                                className="pl-10 bg-gray-950/50 border-gray-800 text-white font-mono focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-gray-700 transition-all"
                            />
                        </div>
                    </div>

                    {/* HTB API Token */}
                    <div className="space-y-3 group">
                        <Label
                            htmlFor="htb_token"
                            className="turret-medium text-white uppercase text-xs tracking-widest group-focus-within:text-terminal-green transition-colors"
                        >
                            HTB API Token
                        </Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                            <Input
                                id="htb_token"
                                name="htb_token"
                                type={showToken ? "text" : "password"}
                                defaultValue={profile?.htb_token || ""}
                                placeholder="eyJ..."
                                className="pl-10 pr-10 bg-gray-950/50 border-gray-800 text-white font-mono focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-gray-700 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                            >
                                {showToken ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 turret-light">
                            Required for auto-submitting flags to HackTheBox.
                            Stored securely.
                        </p>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <div
                            className={`flex items-center gap-3 p-4 rounded border text-sm font-mono animate-in fade-in slide-in-from-top-1 ${
                                message.type === "error"
                                    ? "bg-red-950/30 border-red-900 text-red-400"
                                    : "bg-green-950/30 border-terminal-green text-terminal-green"
                            }`}
                        >
                            {message.type === "error" ? (
                                <AlertCircle className="h-4 w-4" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="uppercase">{message.text}</span>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-gray-800">
                        <Button
                            type="submit"
                            className="bg-terminal-green text-black hover:bg-terminal-green/80 turret-bold font-bold w-full md:w-auto"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 animate-spin" />
                                    OVERWRITING...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    SAVE_CONFIG
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
