"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Save, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
// Import server actions
import { createChallenge, updateChallenge } from "@/app/admin/actions";

// Define props to allow reuse for "Edit" mode
interface ChallengeFormProps {
    challenge?: {
        id: string;
        title: string;
        description: string;
        category: string;
        difficulty: string;
        points: number;
        flag: string;
        file_url?: string | null;
    };
    isEditMode?: boolean;
}

export default function ChallengeForm({
    challenge,
    isEditMode = false,
}: ChallengeFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        let result;

        if (isEditMode && challenge) {
            // Append ID for update
            formData.append("id", challenge.id);
            result = await updateChallenge(formData);
        } else {
            result = await createChallenge(formData);
        }

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Success redirect is handled by server action,
            // but we ensure loading state persists during redirect
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    asChild
                    className="text-gray-400 hover:text-white"
                >
                    <Link href="/admin/challenges">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-terminal-green text-black hover:bg-terminal-green/80 font-bold font-mono"
                >
                    {loading
                        ? "PROCESSING..."
                        : isEditMode
                          ? "UPDATE_CHALLENGE"
                          : "DEPLOY_CHALLENGE"}
                    <Save className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">
                                    Challenge Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={challenge?.title}
                                    placeholder="e.g. Return of the Jedi"
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="description"
                                    className="text-white"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={challenge?.description}
                                    placeholder="Use Markdown for formatting..."
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green min-h-[200px] font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="file_url"
                                    className="text-white"
                                >
                                    File URL (Optional)
                                </Label>
                                <Input
                                    id="file_url"
                                    name="file_url"
                                    defaultValue={challenge?.file_url || ""}
                                    placeholder="https://..."
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green font-mono text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="category"
                                    className="text-white"
                                >
                                    Category
                                </Label>
                                <Select
                                    name="category"
                                    defaultValue={challenge?.category || "Web"}
                                >
                                    <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        <SelectItem value="Web">
                                            Web Exploitation
                                        </SelectItem>
                                        <SelectItem value="Crypto">
                                            Cryptography
                                        </SelectItem>
                                        <SelectItem value="Pwn">
                                            Binary Exploitation
                                        </SelectItem>
                                        <SelectItem value="Forensics">
                                            Forensics
                                        </SelectItem>
                                        <SelectItem value="Reverse">
                                            Reverse Engineering
                                        </SelectItem>
                                        <SelectItem value="Misc">
                                            Miscellaneous
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="difficulty"
                                    className="text-white"
                                >
                                    Difficulty
                                </Label>
                                <Select
                                    name="difficulty"
                                    defaultValue={
                                        challenge?.difficulty || "Easy"
                                    }
                                >
                                    <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        <SelectItem value="Easy">
                                            Easy
                                        </SelectItem>
                                        <SelectItem value="Medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="Hard">
                                            Hard
                                        </SelectItem>
                                        <SelectItem value="Insane">
                                            Insane
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="points" className="text-white">
                                    Points
                                </Label>
                                <Input
                                    id="points"
                                    name="points"
                                    type="number"
                                    defaultValue={challenge?.points || 100}
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green"
                                    required
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-800">
                                <Label
                                    htmlFor="flag"
                                    className="text-terminal-green font-bold"
                                >
                                    Flag (Secret)
                                </Label>
                                <Input
                                    id="flag"
                                    name="flag"
                                    defaultValue={challenge?.flag}
                                    placeholder="CTF{...}"
                                    className="bg-gray-900 border-terminal-green/50 text-terminal-green focus:ring-terminal-green font-mono"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    The exact string users must submit.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="p-4 rounded-md bg-red-900/20 border border-red-900 text-red-400 flex items-center gap-2 text-sm animate-in fade-in">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
