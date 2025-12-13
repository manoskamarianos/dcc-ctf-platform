"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Save,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Flag,
    Server,
    Monitor,
    Terminal,
} from "lucide-react";
import Link from "next/link";
import {
    createContestWithItems,
    updateContestWithItems,
} from "@/app/admin/contests/actions";

interface Item {
    id: string;
    title: string;
    category?: string; // For challenges
    os?: string; // For machines
    difficulty: string;
    points: number;
    is_active: boolean;
}

interface ContestFormProps {
    contest?: {
        id: string;
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        contest_items?: {
            challenge_id: string | null;
            machine_id: string | null;
        }[];
    };
    availableChallenges: Item[];
    availableMachines: Item[];
    isEditMode?: boolean;
}

const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const localIso = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
    ).toISOString();
    return localIso.slice(0, 16);
};

export default function ContestForm({
    contest,
    availableChallenges,
    availableMachines,
    isEditMode = false,
}: ContestFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Initialize selections based on existing contest items
    const [selectedChallenges, setSelectedChallenges] = useState<string[]>(
        contest?.contest_items
            ?.map((i) => i.challenge_id)
            .filter((id): id is string => id !== null) || [],
    );

    const [selectedMachines, setSelectedMachines] = useState<string[]>(
        contest?.contest_items
            ?.map((i) => i.machine_id)
            .filter((id): id is string => id !== null) || [],
    );

    const toggleChallenge = (id: string) => {
        setSelectedChallenges((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleMachine = (id: string) => {
        setSelectedMachines((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        // Validation: End time after start time
        const start = new Date(formData.get("start_time") as string);
        const end = new Date(formData.get("end_time") as string);

        if (end <= start) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        // Append the selected IDs as JSON strings
        formData.append("challenge_ids", JSON.stringify(selectedChallenges));
        formData.append("machine_ids", JSON.stringify(selectedMachines));

        let result;
        if (isEditMode && contest) {
            formData.append("id", contest.id);
            result = await updateContestWithItems(formData);
        } else {
            result = await createContestWithItems(formData);
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
                    <Link href="/admin/contests">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-500 text-white hover:bg-purple-600 font-bold font-mono"
                >
                    {loading ? (
                        "PROCESSING..."
                    ) : (
                        <span className="flex items-center">
                            {isEditMode ? "UPDATE_CONTEST" : "SCHEDULE_CONTEST"}
                            <Save className="ml-2 h-4 w-4" />
                        </span>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-base text-gray-300">
                                Event Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={contest?.title}
                                    placeholder="e.g. Weekly CTF"
                                    className="bg-gray-900 border-gray-800 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="start_time"
                                    className="text-white flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" /> Start
                                </Label>
                                <Input
                                    id="start_time"
                                    name="start_time"
                                    type="datetime-local"
                                    defaultValue={formatDateForInput(
                                        contest?.start_time,
                                    )}
                                    className="bg-gray-900 border-gray-800 text-white [color-scheme:dark]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="end_time"
                                    className="text-white flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" /> End
                                </Label>
                                <Input
                                    id="end_time"
                                    name="end_time"
                                    type="datetime-local"
                                    defaultValue={formatDateForInput(
                                        contest?.end_time,
                                    )}
                                    className="bg-gray-900 border-gray-800 text-white [color-scheme:dark]"
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
                                    defaultValue={contest?.description}
                                    className="bg-gray-900 border-gray-800 text-white min-h-[150px]"
                                />
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

                {/* Right Col: Item Selection */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-950 border-gray-800 h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base text-gray-300 flex justify-between">
                                <span>Contest Scope</span>
                                <Badge variant="outline">
                                    Selected:{" "}
                                    {selectedChallenges.length +
                                        selectedMachines.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Tabs defaultValue="challenges" className="w-full">
                                <TabsList className="bg-gray-900 border border-gray-800 w-full justify-start">
                                    <TabsTrigger
                                        value="challenges"
                                        className="data-[state=active]:bg-terminal-green data-[state=active]:text-black"
                                    >
                                        <Flag className="w-4 h-4 mr-2" />
                                        Challenges ({availableChallenges.length}
                                        )
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="machines"
                                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                    >
                                        <Server className="w-4 h-4 mr-2" />
                                        Machines ({availableMachines.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Challenges List */}
                                <TabsContent
                                    value="challenges"
                                    className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-2"
                                >
                                    {availableChallenges.map((c) => (
                                        <div
                                            key={c.id}
                                            className={`flex items-center justify-between p-3 rounded border transition-colors ${
                                                selectedChallenges.includes(
                                                    c.id,
                                                )
                                                    ? "bg-terminal-green/10 border-terminal-green/50"
                                                    : "bg-gray-900/30 border-gray-800 hover:border-gray-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`c-${c.id}`}
                                                    checked={selectedChallenges.includes(
                                                        c.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleChallenge(c.id)
                                                    }
                                                    className="border-gray-500 data-[state=checked]:bg-terminal-green data-[state=checked]:text-black"
                                                />
                                                <div className="flex flex-col">
                                                    <Label
                                                        htmlFor={`c-${c.id}`}
                                                        className="font-bold text-white cursor-pointer"
                                                    >
                                                        {c.title}
                                                    </Label>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span>
                                                            {c.category}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {c.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-mono text-terminal-green">
                                                {c.points} PTS
                                            </div>
                                        </div>
                                    ))}
                                    {availableChallenges.length === 0 && (
                                        <div className="text-gray-500 text-center py-8">
                                            No active challenges found.
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Machines List */}
                                <TabsContent
                                    value="machines"
                                    className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-2"
                                >
                                    {availableMachines.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`flex items-center justify-between p-3 rounded border transition-colors ${
                                                selectedMachines.includes(m.id)
                                                    ? "bg-blue-900/20 border-blue-500/50"
                                                    : "bg-gray-900/30 border-gray-800 hover:border-gray-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`m-${m.id}`}
                                                    checked={selectedMachines.includes(
                                                        m.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleMachine(m.id)
                                                    }
                                                    className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                                                />
                                                <div className="flex flex-col">
                                                    <Label
                                                        htmlFor={`m-${m.id}`}
                                                        className="font-bold text-white cursor-pointer flex items-center gap-2"
                                                    >
                                                        {m.os === "Windows" ? (
                                                            <Monitor className="w-3 h-3 text-blue-400" />
                                                        ) : (
                                                            <Terminal className="w-3 h-3 text-orange-400" />
                                                        )}
                                                        {m.title}
                                                    </Label>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span>
                                                            {m.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-mono text-blue-400">
                                                {m.points} PTS
                                            </div>
                                        </div>
                                    ))}
                                    {availableMachines.length === 0 && (
                                        <div className="text-gray-500 text-center py-8">
                                            No active machines found.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
