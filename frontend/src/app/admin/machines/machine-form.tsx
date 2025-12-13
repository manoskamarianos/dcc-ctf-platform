"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    Save,
    AlertCircle,
    ArrowLeft,
    Monitor,
    Terminal,
    Smartphone,
    Globe,
    Server,
} from "lucide-react";
import Link from "next/link";
import { createLocalMachine, updateMachine } from "./actions";

interface MachineFormProps {
    machine?: {
        id: string;
        title: string;
        os: string;
        difficulty: string;
        points: number;
        flag?: string | null; // Only for local
        avatar_url?: string | null;
        htb_id?: number | null;
    };
    isEditMode?: boolean;
}

export default function MachineForm({
    machine,
    isEditMode = false,
}: MachineFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const isHtb = !!machine?.htb_id;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        let result;

        if (isEditMode && machine) {
            formData.append("id", machine.id);
            result = await updateMachine(formData);
        } else {
            result = await createLocalMachine(formData);
        }

        if (result?.error) {
            setError(result.error);
            setLoading(false);
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
                    <Link href="/admin/machines">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardContent className="p-6 space-y-4">
                            {isHtb && (
                                <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded mb-4 flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-blue-400" />
                                    <div className="text-sm">
                                        <p className="text-blue-100 font-bold">
                                            Synced from HackTheBox
                                        </p>
                                        <p className="text-blue-300/70">
                                            Core details are managed via Sync.
                                            You can override Points or
                                            Difficulty here locally.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">
                                    Machine Name
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={machine?.title}
                                    placeholder="e.g. Lame, Legacy"
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="os" className="text-white">
                                        Operating System
                                    </Label>
                                    <Select
                                        name="os"
                                        defaultValue={machine?.os || "Linux"}
                                    >
                                        <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                            <SelectItem value="Linux">
                                                <div className="flex items-center gap-2">
                                                    <Terminal className="h-4 w-4" />{" "}
                                                    Linux
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Windows">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="h-4 w-4" />{" "}
                                                    Windows
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Android">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" />{" "}
                                                    Android
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Other">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4" />{" "}
                                                    Other
                                                </div>
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
                                            machine?.difficulty || "Medium"
                                        }
                                    >
                                        <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                                            <SelectValue />
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
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="avatar_url"
                                    className="text-white"
                                >
                                    Avatar URL (Optional)
                                </Label>
                                <Input
                                    id="avatar_url"
                                    name="avatar_url"
                                    defaultValue={machine?.avatar_url || ""}
                                    placeholder="https://..."
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green font-mono text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Settings & Flag */}
                <div className="space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="points" className="text-white">
                                    Points Awarded
                                </Label>
                                <Input
                                    id="points"
                                    name="points"
                                    type="number"
                                    defaultValue={machine?.points || 20}
                                    className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green"
                                    required
                                />
                            </div>

                            {/* Show Flag Input ONLY if it's a Local Machine */}
                            {!isHtb ? (
                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    <Label
                                        htmlFor="flag"
                                        className="text-terminal-green font-bold"
                                    >
                                        Root Flag (Local)
                                    </Label>
                                    <Input
                                        id="flag"
                                        name="flag"
                                        defaultValue={machine?.flag || ""}
                                        placeholder="root_flag_here"
                                        className="bg-gray-900 border-terminal-green/50 text-terminal-green focus:ring-terminal-green font-mono"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        Since this is a local simulation, you
                                        must provide the expected flag.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    <Label className="text-gray-500">
                                        HTB ID (Read Only)
                                    </Label>
                                    <Input
                                        value={machine.htb_id || ""}
                                        disabled
                                        className="bg-black border-gray-800 text-gray-500 font-mono cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        Flag verification is handled by HTB API.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="p-4 rounded-md bg-red-900/20 border border-red-900 text-red-400 flex items-center gap-2 text-sm animate-in fade-in">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-terminal-green text-black hover:bg-terminal-green/80 font-bold font-mono"
                    >
                        {loading ? "SAVING..." : "SAVE_MACHINE"}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
