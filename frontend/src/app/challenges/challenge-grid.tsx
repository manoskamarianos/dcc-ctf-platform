"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    Download,
    Terminal,
    AlertCircle,
    Loader2,
    Hash,
    Cpu,
    Skull,
    Zap,
    Lightbulb,
    ShieldAlert,
} from "lucide-react";
import { submitFlag } from "./actions";
import ReactMarkdown from "react-markdown";

// Added Hints to the interface
interface Challenge {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
    description: string;
    file_url?: string | null;
    solved: boolean;
    hints: { content: string }[]; // New field
    debug_flag?: string | null;
}

const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
        case "easy":
            return "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20";
        case "medium":
            return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20";
        case "hard":
            return "text-orange-400 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20";
        case "insane":
            return "text-red-500 border-red-600/30 bg-red-600/10 hover:bg-red-600/20";
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

export default function ChallengeGrid({
    challenges,
}: {
    challenges: Challenge[];
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-md bg-black/50">
                    <Terminal className="h-10 w-10 mb-4 text-gray-700" />
                    <p className="font-mono text-lg">NO_DATA_FOUND</p>
                    <p className="turret-light text-sm">
                        Sector clear. No active challenges.
                    </p>
                </div>
            )}
            {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
        </div>
    );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
    const [flag, setFlag] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{
        type: "success" | "error";
        msg: string;
    } | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const result = await submitFlag(challenge.id, flag);

        if (result.success) {
            setStatus({ type: "success", msg: result.message! });
            setTimeout(() => setIsOpen(false), 2000);
        } else {
            setStatus({ type: "error", msg: result.error! });
        }
        setLoading(false);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setStatus(null);
            }}
        >
            <DialogTrigger asChild>
                <Card
                    className={`
                        group relative overflow-hidden bg-black/60 backdrop-blur-sm border border-gray-800 
                        hover:border-terminal-green/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] 
                        transition-all duration-300 cursor-pointer rounded-sm
                        ${challenge.solved ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0" : ""}
                    `}
                >
                    {/* Corner decorative elements */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-gray-800 to-transparent opacity-20 group-hover:from-terminal-green group-hover:to-transparent transition-all"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-800 group-hover:bg-terminal-green transition-colors"></div>

                    {challenge.solved && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-terminal-green text-black font-mono text-[10px] tracking-wider border-none animate-in zoom-in">
                                SOLVED
                            </Badge>
                        </div>
                    )}

                    <CardHeader className="pb-2 space-y-1">
                        <div className="flex justify-between items-start">
                            <Badge
                                variant="outline"
                                className="border-gray-700 text-gray-400 font-mono text-[10px] uppercase tracking-wider mb-2"
                            >
                                {challenge.category}
                            </Badge>
                            <span className="font-mono text-terminal-green font-bold text-sm tracking-tight group-hover:text-white transition-colors">
                                {challenge.points} PTS
                            </span>
                        </div>
                        <CardTitle className="text-white text-lg turret-bold group-hover:text-terminal-green transition-colors line-clamp-1">
                            {challenge.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="outline"
                                className={`font-mono text-[10px] uppercase tracking-wider h-6 ${getDifficultyColor(challenge.difficulty)}`}
                            >
                                {getDifficultyIcon(challenge.difficulty)}
                                {challenge.difficulty}
                            </Badge>
                            <div className="text-gray-600 group-hover:text-terminal-green/50 transition-colors">
                                <Hash className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="bg-black/95 border border-terminal-green text-white max-w-2xl shadow-[0_0_50px_rgba(34,197,94,0.15)] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Terminal Header */}
                <DialogHeader className="bg-gray-900/50 border-b border-gray-800 p-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl turret-bold text-terminal-green flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            {challenge.title}
                        </DialogTitle>
                        {challenge.solved && (
                            <Badge className="bg-terminal-green text-black font-mono">
                                <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                COMPLETED
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-gray-500 font-mono text-xs flex gap-3 pt-1">
                        <span>ID: {challenge.id.substring(0, 8)}</span>
                        <span>//</span>
                        <span className="text-white">
                            {challenge.points} PTS
                        </span>
                        <span>//</span>
                        <span className="uppercase text-white">
                            {challenge.category}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Description Area */}
                    <div className="font-mono text-sm text-gray-300 leading-relaxed bg-gray-950/50 p-4 border-l-2 border-gray-700">
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => (
                                    <a
                                        className="text-terminal-green hover:underline"
                                        {...props}
                                    />
                                ),
                                code: ({
                                    node,
                                    className,
                                    children,
                                    ...props
                                }) => (
                                    <code
                                        className="bg-black/50 p-1 rounded font-mono text-xs"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                ),
                            }}
                        >
                            {challenge.description}
                        </ReactMarkdown>
                    </div>

                    {/* Download Section */}
                    {challenge.file_url && (
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                className="w-full border-gray-700 text-gray-300 hover:text-terminal-green hover:border-terminal-green hover:bg-terminal-green/10 font-mono text-xs h-10 transition-all"
                                asChild
                            >
                                <a
                                    href={challenge.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    DOWNLOAD_ASSETS
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* --- NEW HINTS SECTION --- */}
                    {challenge.hints && challenge.hints.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-2 turret-bold tracking-wider">
                                <Lightbulb className="h-4 w-4" />
                                INTEL_DROPS
                            </h4>
                            <div className="space-y-2">
                                {challenge.hints.map((hint, i) => (
                                    <div
                                        key={i}
                                        className="bg-yellow-950/10 border border-yellow-500/20 p-3 rounded text-sm text-yellow-100/80 font-mono flex gap-3 items-start"
                                    >
                                        <span className="text-yellow-500 shrink-0 select-none">
                                            {">"}
                                        </span>
                                        {hint.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {challenge.debug_flag && (
                        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded space-y-2">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                                <ShieldAlert className="h-4 w-4" />
                                Admin Eyes Only
                            </div>
                            <div className="bg-black/50 p-2 rounded border border-red-900/30 font-mono text-sm text-red-200 break-all">
                                {challenge.debug_flag}
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">
                                This is the expected flag for YOUR user ID.
                            </p>
                        </div>
                    )}
                    {/* ------------------------- */}

                    {/* Input Section */}
                    {!challenge.solved ? (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-4 border-t border-gray-800 border-dashed"
                        >
                            <div className="space-y-3">
                                <Label
                                    htmlFor="flag"
                                    className="text-terminal-green turret-bold tracking-wider text-sm flex items-center gap-2"
                                >
                                    <span className="animate-pulse">_</span>{" "}
                                    INPUT_FLAG
                                </Label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-mono">
                                            $
                                        </div>
                                        <Input
                                            id="flag"
                                            placeholder="CTF{...}"
                                            value={flag}
                                            onChange={(e) =>
                                                setFlag(e.target.value)
                                            }
                                            className="bg-gray-900/50 border-gray-700 font-mono text-white pl-8 focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-gray-700"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading || !flag}
                                        className="bg-terminal-green text-black hover:bg-terminal-green/80 turret-bold font-bold w-28"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "EXECUTE"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="pt-4 border-t border-gray-800 border-dashed">
                            <div className="bg-green-950/20 border border-green-900/50 p-3 rounded text-center">
                                <p className="text-green-500 font-mono text-sm">
                                    // SYSTEM SECURED. FLAG CAPTURED.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {status && (
                        <div
                            className={`p-3 rounded-sm border-l-4 text-sm font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
                                status.type === "success"
                                    ? "bg-green-950/30 border-terminal-green text-green-400"
                                    : "bg-red-950/30 border-red-500 text-red-400"
                            }`}
                        >
                            {status.type === "success" ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <span className="uppercase">{status.msg}</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
