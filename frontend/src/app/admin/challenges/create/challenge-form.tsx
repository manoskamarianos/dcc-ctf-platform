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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Save,
    AlertCircle,
    ArrowLeft,
    Lightbulb,
    Plus,
    Trash2,
    Eye,
    PenLine,
    Terminal,
    Download,
    Cpu,
    Zap,
    Skull,
    Wand2,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { createChallenge, updateChallenge } from "@/app/admin/actions";
import { leetify, type LeetLevel } from "@/lib/leetify";
import ReactMarkdown from "react-markdown"; // <--- Import this

// --- Helpers for Difficulty UI (Colors & Icons) ---
const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
        case "easy":
            return "text-green-400 border-green-500/30 bg-green-500/10";
        case "medium":
            return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        case "hard":
            return "text-orange-400 border-orange-500/30 bg-orange-500/10";
        case "insane":
            return "text-red-500 border-red-600/30 bg-red-600/10";
        default:
            return "text-gray-400 border-gray-500/30";
    }
};

const getDifficultyIcon = (diff: string) => {
    switch (diff.toLowerCase()) {
        case "easy":
            return <Zap className="w-3 h-3 mr-1" />;
        case "medium":
            return <Cpu className="w-3 h-3 mr-1" />;
        case "hard":
            return <AlertCircle className="w-3 h-3 mr-1" />;
        case "insane":
            return <Skull className="w-3 h-3 mr-1" />;
        default:
            return null;
    }
};

// --- Props Interface ---
interface ChallengeFormProps {
    challenge?: {
        id: string;
        title: string;
        description: string;
        category: string;
        difficulty: string;
        points: number;
        flag: string;
        flag_template?: string;
        file_url?: string | null;
        hints?: { content: string }[];
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

    // --- State: Form Data ---
    const [formData, setFormData] = useState({
        title: challenge?.title || "",
        description: challenge?.description || "",
        category: challenge?.category || "Web",
        difficulty: challenge?.difficulty || "Easy",
        points: challenge?.points || 100,
        flag: challenge?.flag_template || challenge?.flag || "",
        file_url: challenge?.file_url || "",
    });

    // --- State: Hints ---
    const [hints, setHints] = useState<string[]>(
        challenge?.hints && challenge.hints.length > 0
            ? challenge.hints.map((h) => h.content)
            : [""],
    );

    // --- Handlers ---
    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addHint = () => setHints([...hints, ""]);

    const removeHint = (index: number) => {
        const newHints = [...hints];
        newHints.splice(index, 1);
        setHints(newHints);
    };

    const updateHint = (index: number, value: string) => {
        const newHints = [...hints];
        newHints[index] = value;
        setHints(newHints);
    };

    // --- LEETIFY HANDLER ---
    const handleLeetify = (level: LeetLevel) => {
        if (!formData.flag) return;
        const newFlag = leetify(formData.flag, level);
        handleChange("flag", newFlag);
    };

    async function handleSubmit(submitFormData: FormData) {
        setLoading(true);
        setError(null);
        let result;
        if (isEditMode && challenge) {
            submitFormData.append("id", challenge.id);
            result = await updateChallenge(submitFormData);
        } else {
            result = await createChallenge(submitFormData);
        }

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    asChild
                    className="text-gray-400 hover:text-white"
                >
                    <Link href="/admin/challenges">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="write" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-gray-900 border border-gray-800">
                        <TabsTrigger
                            value="write"
                            className="data-[state=active]:bg-terminal-green data-[state=active]:text-black font-mono"
                        >
                            <PenLine className="w-4 h-4 mr-2" /> WRITE
                        </TabsTrigger>
                        <TabsTrigger
                            value="preview"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono"
                        >
                            <Eye className="w-4 h-4 mr-2" /> PREVIEW
                        </TabsTrigger>
                    </TabsList>
                </div>

                <form action={handleSubmit} className="space-y-8">
                    {/* --- WRITE TAB --- */}
                    <TabsContent
                        value="write"
                        className="space-y-8 mt-0 animate-in fade-in-50"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column: Details & Hints */}
                            <div className="md:col-span-2 space-y-6">
                                <Card className="bg-gray-950 border-gray-800">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="title"
                                                className="text-white"
                                            >
                                                Challenge Title
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
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
                                                value={formData.description}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
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
                                                value={formData.file_url}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "file_url",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://..."
                                                className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green font-mono text-sm"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-gray-800 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-yellow-500 flex items-center gap-2 font-bold">
                                                    <Lightbulb className="h-4 w-4" />{" "}
                                                    Hints
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={addHint}
                                                    className="text-xs text-terminal-green hover:bg-terminal-green/10"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />{" "}
                                                    Add Hint
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {hints.map((hint, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex gap-2"
                                                    >
                                                        <Input
                                                            name="hints"
                                                            value={hint}
                                                            onChange={(e) =>
                                                                updateHint(
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={`Hint #${index + 1}`}
                                                            className="bg-gray-900/50 border-gray-800 text-gray-300 focus:border-yellow-500 font-mono text-sm"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeHint(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-red-400 hover:bg-red-900/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Meta & Flag */}
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
                                                value={formData.category}
                                                onValueChange={(val) =>
                                                    handleChange(
                                                        "category",
                                                        val,
                                                    )
                                                }
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
                                                value={formData.difficulty}
                                                onValueChange={(val) =>
                                                    handleChange(
                                                        "difficulty",
                                                        val,
                                                    )
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
                                            <Label
                                                htmlFor="points"
                                                className="text-white"
                                            >
                                                Points
                                            </Label>
                                            <Input
                                                id="points"
                                                name="points"
                                                type="number"
                                                value={formData.points}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "points",
                                                        e.target.value,
                                                    )
                                                }
                                                className="bg-gray-900 border-gray-800 text-white focus:border-terminal-green"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="flag"
                                                    className="text-terminal-green font-bold"
                                                >
                                                    Flag Template
                                                </Label>

                                                {/* --- DROPDOWN FOR LEETIFY --- */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 font-mono border border-purple-500/30"
                                                        >
                                                            <Wand2 className="h-3 w-3 mr-1" />
                                                            LEETIFY
                                                            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="bg-gray-900 border-purple-500/30 text-white"
                                                    >
                                                        <DropdownMenuLabel className="text-xs text-purple-400">
                                                            Select Intensity
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-gray-800" />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleLeetify(
                                                                    "basic",
                                                                )
                                                            }
                                                            className="text-xs cursor-pointer hover:bg-purple-900/20"
                                                        >
                                                            Basic (e.g. E=3)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleLeetify(
                                                                    "advanced",
                                                                )
                                                            }
                                                            className="text-xs cursor-pointer hover:bg-purple-900/20"
                                                        >
                                                            Advanced (e.g. A=@)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleLeetify(
                                                                    "ultra",
                                                                )
                                                            }
                                                            className="text-xs cursor-pointer hover:bg-purple-900/20 text-purple-300"
                                                        >
                                                            Ultra (e.g. M=/\/\\)
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                {/* --------------------------- */}
                                            </div>
                                            <Input
                                                id="flag"
                                                name="flag"
                                                value={formData.flag}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "flag",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="DCC{flag_{hash}}"
                                                className="bg-gray-900 border-terminal-green/50 text-terminal-green focus:ring-terminal-green font-mono"
                                                required
                                            />
                                            <div className="text-[10px] text-gray-500 flex flex-col gap-1 pt-1">
                                                <p>
                                                    <span className="text-white font-bold">
                                                        Static Flag:
                                                    </span>{" "}
                                                    Type normally (e.g.{" "}
                                                    <span className="font-mono text-gray-400">
                                                        {"DCC{static}"}
                                                    </span>
                                                    ). Everyone gets the same
                                                    flag.
                                                </p>
                                                <p>
                                                    <span className="text-white font-bold">
                                                        Unique Flag:
                                                    </span>{" "}
                                                    Add{" "}
                                                    <span className="font-mono text-yellow-500">
                                                        {"{hash}"}
                                                    </span>{" "}
                                                    (e.g.{" "}
                                                    <span className="font-mono text-gray-400">
                                                        {"DCC{root_{hash}}"}
                                                    </span>
                                                    ). Generates a unique 8-char
                                                    suffix per user.
                                                </p>
                                            </div>
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
                    </TabsContent>

                    {/* --- PREVIEW TAB --- */}
                    <TabsContent
                        value="preview"
                        className="mt-0 animate-in fade-in-50"
                    >
                        <div className="flex justify-center">
                            <Card className="w-full max-w-2xl bg-black/95 border border-terminal-green text-white shadow-[0_0_50px_rgba(34,197,94,0.15)]">
                                <div className="bg-gray-900/50 border-b border-gray-800 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xl turret-bold text-terminal-green flex items-center gap-2">
                                            <Terminal className="h-5 w-5" />
                                            {formData.title ||
                                                "Untitled Challenge"}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`font-mono text-[10px] uppercase tracking-wider h-6 ${getDifficultyColor(formData.difficulty)}`}
                                        >
                                            {getDifficultyIcon(
                                                formData.difficulty,
                                            )}
                                            {formData.difficulty}
                                        </Badge>
                                    </div>
                                    <div className="text-gray-500 font-mono text-xs flex gap-3 pt-1">
                                        <span>ID: preview_mode</span>
                                        <span>//</span>
                                        <span className="text-white">
                                            {formData.points} PTS
                                        </span>
                                        <span>//</span>
                                        <span className="uppercase text-white">
                                            {formData.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* --- MARKDOWN RENDERER --- */}
                                    <div className="font-mono text-sm text-gray-300 leading-relaxed bg-gray-950/50 p-4 border-l-2 border-gray-700 min-h-[100px]">
                                        <ReactMarkdown
                                            components={{
                                                strong: ({
                                                    node,
                                                    ...props
                                                }) => (
                                                    <strong
                                                        {...props}
                                                        className="text-white font-bold"
                                                    />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-terminal-green hover:underline decoration-dashed"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                ),
                                                code: ({ node, ...props }) => (
                                                    <code
                                                        {...props}
                                                        className="bg-gray-800 text-terminal-green px-1 py-0.5 rounded text-xs"
                                                    />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul
                                                        {...props}
                                                        className="list-disc pl-4 space-y-1 my-2"
                                                    />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol
                                                        {...props}
                                                        className="list-decimal pl-4 space-y-1 my-2"
                                                    />
                                                ),
                                                h1: ({ node, ...props }) => (
                                                    <h1
                                                        {...props}
                                                        className="text-lg font-bold text-white mt-4 mb-2"
                                                    />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2
                                                        {...props}
                                                        className="text-base font-bold text-white mt-3 mb-2"
                                                    />
                                                ),
                                                p: ({ node, ...props }) => (
                                                    <p
                                                        {...props}
                                                        className="mb-2 last:mb-0"
                                                    />
                                                ),
                                            }}
                                        >
                                            {formData.description ||
                                                "*No description provided.*"}
                                        </ReactMarkdown>
                                    </div>
                                    {/* ------------------------- */}

                                    {formData.file_url && (
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                disabled
                                                className="w-full border-gray-700 text-gray-300 font-mono text-xs h-10 opacity-50 cursor-not-allowed"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                DOWNLOAD_ASSETS (Mock)
                                            </Button>
                                        </div>
                                    )}

                                    {hints.filter((h) => h.trim()).length >
                                        0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-2 turret-bold tracking-wider">
                                                <Lightbulb className="h-4 w-4" />{" "}
                                                INTEL_DROPS
                                            </h4>
                                            <div className="space-y-2">
                                                {hints
                                                    .filter((h) => h.trim())
                                                    .map((hint, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-yellow-950/10 border border-yellow-500/20 p-3 rounded text-sm text-yellow-100/80 font-mono flex gap-3 items-start"
                                                        >
                                                            <span className="text-yellow-500 shrink-0 select-none">
                                                                {">"}
                                                            </span>
                                                            {hint}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t border-gray-800 border-dashed opacity-50">
                                        <div className="space-y-3">
                                            <Label className="text-terminal-green turret-bold tracking-wider text-sm flex items-center gap-2">
                                                <span className="animate-pulse">
                                                    _
                                                </span>{" "}
                                                INPUT_FLAG
                                            </Label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1 group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-mono">
                                                        $
                                                    </div>
                                                    <Input
                                                        disabled
                                                        placeholder="CTF{...}"
                                                        className="bg-gray-900/50 border-gray-700 font-mono text-white pl-8"
                                                    />
                                                </div>
                                                <Button
                                                    disabled
                                                    className="bg-terminal-green text-black turret-bold font-bold w-28"
                                                >
                                                    EXECUTE
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <div className="flex justify-end pt-4 border-t border-gray-800">
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
                </form>
            </Tabs>
        </div>
    );
}
