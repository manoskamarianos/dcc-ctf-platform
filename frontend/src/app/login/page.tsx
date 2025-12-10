"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Mail, AlertCircle, KeyRound } from "lucide-react";
import { login } from "@/app/auth/actions";

export default function Login() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Redirect is handled by the server action
            // We refresh just to ensure client cache is updated immediately
            router.refresh();
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md border-terminal-green/50 bg-black text-terminal-green shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 rounded-full bg-terminal-green/10 ring-1 ring-terminal-green/50">
                            <Shield className="h-8 w-8 text-terminal-green" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center tracking-wider font-mono">
                        AUTHENTICATE
                    </CardTitle>
                    <CardDescription className="text-center text-gray-400 font-mono text-xs">
                        Enter credentials to bypass firewall
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="hacker@example.com"
                                    className="pl-10 bg-gray-900 border-gray-700 text-white focus:ring-terminal-green focus:border-terminal-green"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-gray-900 border-gray-700 text-white focus:ring-terminal-green focus:border-terminal-green"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm font-mono bg-red-900/20 p-3 rounded border border-red-900/50 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>Error: {error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-terminal-green text-black hover:bg-terminal-green/80 font-bold transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="animate-pulse">
                                    ACCESSING MAINFRAME...
                                </span>
                            ) : (
                                "INITIATE LOGIN"
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-gray-500 font-mono">
                                OR
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-400 font-mono">
                        No access clearance?{" "}
                        <Link
                            href="/register"
                            className="text-terminal-green hover:underline decoration-dashed underline-offset-4"
                        >
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
