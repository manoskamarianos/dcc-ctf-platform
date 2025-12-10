"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    Flag,
    Download,
    Terminal,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { submitFlag } from "./actions";
import ReactMarkdown from "react-markdown";

interface Challenge {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
    description: string;
    file_url?: string | null;
    solved: boolean;
}

const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
        case "easy":
            return "text-green-400 border-green-400/30 bg-green-400/10";
        case "medium":
            return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
        case "hard":
            return "text-red-400 border-red-400/30 bg-red-400/10";
        case "insane":
            return "text-purple-400 border-purple-400/30 bg-purple-400/10";
        default:
            return "text-gray-400";
    }
};

export default function ChallengeGrid({
    challenges,
}: {
    challenges: Challenge[];
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500 font-mono">
                    No challenges available in this sector.
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
            setTimeout(() => setIsOpen(false), 2000); // Close dialog on success
        } else {
            setStatus({ type: "error", msg: result.error! });
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card
                    className={`bg-gray-900 border-gray-800 cursor-pointer hover:border-terminal-green/50 transition-all group relative overflow-hidden ${challenge.solved ? "opacity-75" : ""}`}
                >
                    {challenge.solved && (
                        <div className="absolute top-0 right-0 bg-terminal-green text-black text-xs font-bold px-2 py-1 z-10 font-mono">
                            SOLVED
                        </div>
                    )}
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <Badge
                                variant="outline"
                                className="border-gray-700 text-gray-400 mb-2"
                            >
                                {challenge.category}
                            </Badge>
                            <span className="font-mono text-terminal-green font-bold">
                                {challenge.points} PTS
                            </span>
                        </div>
                        <CardTitle className="text-white group-hover:text-terminal-green transition-colors">
                            {challenge.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            className={`font-mono text-xs ${getDifficultyColor(challenge.difficulty)}`}
                        >
                            {challenge.difficulty}
                        </Badge>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="bg-black border-terminal-green/20 text-white max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-mono text-terminal-green flex items-center gap-2">
                            <Terminal className="h-6 w-6" />
                            {challenge.title}
                        </DialogTitle>
                        {challenge.solved && (
                            <Badge className="bg-terminal-green text-black font-mono">
                                <CheckCircle className="w-4 h-4 mr-1" />{" "}
                                COMPLETED
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-gray-400 font-mono flex gap-4 pt-2">
                        <span>Category: {challenge.category}</span>
                        <span>•</span>
                        <span>Points: {challenge.points}</span>
                        <span>•</span>
                        <span className="capitalize">
                            {challenge.difficulty}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="prose prose-invert max-w-none text-gray-300 text-sm font-mono bg-gray-900/50 p-4 rounded border border-gray-800">
                        {/* Simple render, assume description is plain text or use ReactMarkdown */}
                        {challenge.description}
                    </div>

                    {challenge.file_url && (
                        <Button
                            variant="outline"
                            className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                            asChild
                        >
                            <a
                                href={challenge.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download Challenge Assets
                            </a>
                        </Button>
                    )}

                    {!challenge.solved && (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-4 border-t border-gray-800"
                        >
                            <div className="space-y-2">
                                <Label
                                    htmlFor="flag"
                                    className="text-terminal-green"
                                >
                                    Capture The Flag
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="flag"
                                        placeholder="CTF{...}"
                                        value={flag}
                                        onChange={(e) =>
                                            setFlag(e.target.value)
                                        }
                                        className="bg-gray-900 border-gray-700 font-mono text-white focus:border-terminal-green"
                                        autoComplete="off"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading || !flag}
                                        className="bg-terminal-green text-black hover:bg-terminal-green/80 font-bold"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "SUBMIT"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {status && (
                        <div
                            className={`p-3 rounded border text-sm font-mono flex items-center gap-2 ${
                                status.type === "success"
                                    ? "bg-green-900/20 border-green-500 text-green-400"
                                    : "bg-red-900/20 border-red-500 text-red-400"
                            }`}
                        >
                            {status.type === "success" ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            {status.msg}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
