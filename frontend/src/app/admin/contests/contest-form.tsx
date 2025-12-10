"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { createContest, updateContest } from "@/app/admin/actions";

interface ContestFormProps {
    contest?: {
        id: string;
        title: string;
        description: string;
        start_time: string;
        end_time: string;
    };
    isEditMode?: boolean;
}

// Helper to format ISO strings to 'YYYY-MM-DDTHH:MM' for input[type="datetime-local"]
const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Subtract timezone offset to ensure local time aligns
    const localIso = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
    ).toISOString();
    return localIso.slice(0, 16);
};

export default function ContestForm({
    contest,
    isEditMode = false,
}: ContestFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        // Validation: End time must be after start time
        const start = new Date(formData.get("start_time") as string);
        const end = new Date(formData.get("end_time") as string);

        if (end <= start) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        let result;
        if (isEditMode && contest) {
            formData.append("id", contest.id);
            result = await updateContest(formData);
        } else {
            result = await createContest(formData);
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
                    {loading
                        ? "PROCESSING..."
                        : isEditMode
                          ? "UPDATE_CONTEST"
                          : "SCHEDULE_CONTEST"}
                    <Save className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-950 border-gray-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">
                                    Contest Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={contest?.title}
                                    placeholder="e.g. Winter Hacking Festival"
                                    className="bg-gray-900 border-gray-800 text-white focus:border-purple-500"
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
                                    placeholder="Details about the event..."
                                    className="bg-gray-900 border-gray-800 text-white focus:border-purple-500 min-h-[200px] font-mono"
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
                                    htmlFor="start_time"
                                    className="text-white flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" /> Start Time
                                </Label>
                                <Input
                                    id="start_time"
                                    name="start_time"
                                    type="datetime-local"
                                    defaultValue={formatDateForInput(
                                        contest?.start_time,
                                    )}
                                    className="bg-gray-900 border-gray-800 text-white focus:border-purple-500 [color-scheme:dark]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="end_time"
                                    className="text-white flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" /> End Time
                                </Label>
                                <Input
                                    id="end_time"
                                    name="end_time"
                                    type="datetime-local"
                                    defaultValue={formatDateForInput(
                                        contest?.end_time,
                                    )}
                                    className="bg-gray-900 border-gray-800 text-white focus:border-purple-500 [color-scheme:dark]"
                                    required
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
            </div>
        </form>
    );
}
