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
import { User, Lock, Mail, UserPlus, AlertCircle, Cpu } from "lucide-react";
import { signup } from "@/app/auth/actions";

export default function Register() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        const result = await signup(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] p-4">
            
            <Card className="w-full max-w-md bg-black/80 backdrop-blur-md border border-terminal-green/30 text-white shadow-[0_0_30px_rgba(34,197,94,0.15)] relative overflow-hidden">
                
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-terminal-green/50"></div>

                <CardHeader className="space-y-2 pb-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-terminal-green/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                            <div className="relative p-4 rounded-full bg-black border border-terminal-green/50 ring-1 ring-terminal-green/20">
                                <UserPlus className="h-8 w-8 text-terminal-green" />
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center tracking-wider turret-extrabold text-white uppercase">
                        Initialize_User
                    </CardTitle>
                    <CardDescription className="text-center text-gray-400 turret-light flex items-center justify-center gap-2">
                        <Cpu className="w-3 h-3" />
                        <span>Create identity to access mainframe</span>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-2 group">
                            <Label htmlFor="username" className="turret-medium text-gray-300 group-focus-within:text-terminal-green transition-colors">
                                ALIAS (USERNAME)
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="CoolHacker1337"
                                    className="pl-10 bg-gray-950/50 border-gray-800 text-white font-mono placeholder:text-gray-700 focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 transition-all"
                                    required
                                    minLength={3}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2 group">
                            <Label htmlFor="email" className="turret-medium text-gray-300 group-focus-within:text-terminal-green transition-colors">
                                COMMUNICATION_LINK (EMAIL)
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="hacker@example.com"
                                    className="pl-10 bg-gray-950/50 border-gray-800 text-white font-mono placeholder:text-gray-700 focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 group">
                            <Label htmlFor="password" className="turret-medium text-gray-300 group-focus-within:text-terminal-green transition-colors">
                                SECRET_KEY (PASSWORD)
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-terminal-green transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-gray-950/50 border-gray-800 text-white font-mono placeholder:text-gray-700 focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 transition-all"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-red-400 text-sm bg-red-950/30 p-3 rounded border border-red-900/50 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="font-mono">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-terminal-green text-black hover:bg-terminal-green/90 turret-bold tracking-widest uppercase h-11 border border-transparent hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 font-mono animate-pulse">
                                    <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                                    ESTABLISHING_LINK...
                                </span>
                            ) : (
                                "EXECUTE_REGISTRATION"
                            )}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-gray-600 turret-medium tracking-widest border border-gray-800 rounded">
                                EXISTING_USER
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <p className="text-sm text-gray-500 turret-light">
                        Already have an identity?{" "}
                        <Link
                            href="/login"
                            className="text-terminal-green hover:text-white hover:underline decoration-dashed underline-offset-4 transition-colors"
                        >
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}