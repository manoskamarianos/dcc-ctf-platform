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
} from "lucide-react";

interface ProfileFormProps {
    user: User;
    profile: {
        username: string;
        htb_id: string | null;
    } | null;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
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
        <Card className="h-full border-gray-800 bg-black">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-terminal-green" />
                    Configuration
                </CardTitle>
                <CardDescription>
                    Update your operator credentials
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-400">
                            Email Address (Immutable)
                        </Label>
                        <Input
                            value={user.email}
                            disabled
                            className="bg-gray-900/50 border-gray-800 text-gray-500 font-mono cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">
                            Username
                        </Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="username"
                                name="username"
                                defaultValue={profile?.username || ""}
                                placeholder="Update username"
                                className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-terminal-green font-mono"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Warning: Changing username may affect your
                            leaderboard display name.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="htb_id" className="text-white">
                            HackTheBox ID
                        </Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="htb_id"
                                name="htb_id"
                                defaultValue={profile?.htb_id || ""}
                                placeholder="Enter HTB ID"
                                className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-terminal-green font-mono"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Optional: Link your external profile for badge
                            verification.
                        </p>
                    </div>

                    {message && (
                        <div
                            className={`flex items-center gap-2 p-3 rounded border text-sm font-mono animate-in fade-in slide-in-from-top-1 ${
                                message.type === "error"
                                    ? "bg-red-900/20 border-red-900 text-red-400"
                                    : "bg-green-900/20 border-terminal-green text-terminal-green"
                            }`}
                        >
                            {message.type === "error" ? (
                                <AlertCircle className="h-4 w-4" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            {message.text}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-terminal-green text-black hover:bg-terminal-green/80 font-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="animate-pulse">SAVING...</span>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
