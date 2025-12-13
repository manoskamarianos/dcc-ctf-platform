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
    Terminal,
    AlertCircle,
    Loader2,
    Monitor,
    Server,
    Smartphone,
    Globe,
    ShieldCheck,
} from "lucide-react";
import { submitMachineFlag } from "./actions";
import Image from "next/image";

interface Machine {
    id: string;
    title: string;
    os: string;
    difficulty: string;
    points: number;
    avatar_url?: string | null;
    htb_id?: number | null;
    solved: boolean;
}

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

const getOsIcon = (os: string) => {
    const normalized = os.toLowerCase();
    if (normalized.includes("linux")) return <Terminal className="w-4 h-4" />;
    if (normalized.includes("windows")) return <Monitor className="w-4 h-4" />;
    if (normalized.includes("android"))
        return <Smartphone className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
};

export default function MachineGrid({ machines }: { machines: Machine[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-md bg-black/50">
                    <Server className="h-10 w-10 mb-4 text-gray-700" />
                    <p className="font-mono text-lg">NO_TARGETS_DETECTED</p>
                    <p className="turret-light text-sm">
                        Network scan returned zero active hosts.
                    </p>
                </div>
            )}
            {machines.map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
            ))}
        </div>
    );
}

function MachineCard({ machine }: { machine: Machine }) {
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

        const result = await submitMachineFlag(machine.id, flag);

        if (result.success) {
            setStatus({ type: "success", msg: result.message! });
            setTimeout(() => {
                setIsOpen(false);
                // Optional: refresh page logic is handled by server action revalidatePath
            }, 2000);
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
                if (!open) {
                    setStatus(null);
                    setFlag("");
                }
            }}
        >
            <DialogTrigger asChild>
                <Card
                    className={`
                        group relative overflow-hidden bg-black/60 backdrop-blur-sm border border-gray-800 
                        hover:border-terminal-green/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] 
                        transition-all duration-300 cursor-pointer rounded-sm
                        ${machine.solved ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0" : ""}
                    `}
                >
                    {/* Background Glow for HTB machines */}
                    {machine.htb_id && (
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 blur-3xl rounded-full pointer-events-none"></div>
                    )}

                    {machine.solved && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-terminal-green text-black font-mono text-[10px] tracking-wider border-none animate-in zoom-in">
                                PWNED
                            </Badge>
                        </div>
                    )}

                    <CardHeader className="pb-2 space-y-1">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-gray-700 text-gray-400 font-mono text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1"
                                >
                                    {getOsIcon(machine.os)}
                                    {machine.os}
                                </Badge>
                                {machine.htb_id ? (
                                    <Badge
                                        variant="secondary"
                                        className="mb-2 bg-green-900/20 text-green-400 border border-green-900/50 text-[10px]"
                                    >
                                        HTB
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="mb-2 bg-gray-800 text-gray-400 text-[10px]"
                                    >
                                        LOCAL
                                    </Badge>
                                )}
                            </div>
                            <span className="font-mono text-terminal-green font-bold text-sm tracking-tight group-hover:text-white transition-colors">
                                {machine.points} PTS
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {machine.avatar_url && (
                                <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-700 shrink-0">
                                    <Image
                                        src={machine.avatar_url}
                                        alt={machine.title}
                                        fill
                                        className="object-cover"
                                        unoptimized // HTB avatars are external
                                    />
                                </div>
                            )}
                            <CardTitle className="text-white text-lg turret-bold group-hover:text-terminal-green transition-colors line-clamp-1">
                                {machine.title}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="outline"
                                className={`font-mono text-[10px] uppercase tracking-wider h-6 ${getDifficultyColor(machine.difficulty)}`}
                            >
                                {machine.difficulty}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="bg-black/95 border border-terminal-green text-white max-w-lg shadow-[0_0_50px_rgba(34,197,94,0.15)] p-0 gap-0 overflow-hidden">
                <DialogHeader className="bg-gray-900/50 border-b border-gray-800 p-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl turret-bold text-terminal-green flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            {machine.title}
                        </DialogTitle>
                        {machine.solved && (
                            <Badge className="bg-terminal-green text-black font-mono">
                                <CheckCircle className="w-3 h-3 mr-1" /> SYSTEM
                                OWNED
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-gray-500 font-mono text-xs flex gap-3 pt-1">
                        <span>
                            OS: <span className="text-white">{machine.os}</span>
                        </span>
                        <span>//</span>
                        <span>
                            TYPE:{" "}
                            <span className="text-white">
                                {machine.htb_id ? "HTB_LINKED" : "LOCAL_HOST"}
                            </span>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Info Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/30 border border-gray-800 p-3 rounded flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-gray-500 font-mono uppercase">
                                    Difficulty
                                </span>
                                <span
                                    className={`font-bold ${getDifficultyColor(machine.difficulty).split(" ")[0]}`}
                                >
                                    {machine.difficulty}
                                </span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 p-3 rounded flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-gray-500 font-mono uppercase">
                                    Bounty
                                </span>
                                <span className="text-white font-bold">
                                    {machine.points} PTS
                                </span>
                            </div>
                        </div>

                        {machine.htb_id && (
                            <div className="bg-blue-950/20 border border-blue-900/50 p-3 rounded flex items-start gap-3">
                                <Globe className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm text-blue-100 font-bold">
                                        HackTheBox Integration
                                    </p>
                                    <p className="text-xs text-blue-200/70 leading-relaxed">
                                        This is a remote machine. Flags
                                        submitted here will be automatically
                                        verified against the HTB API using your
                                        personal token.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Section */}
                    {!machine.solved ? (
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
                                    ROOT_FLAG
                                </Label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-mono">
                                            #
                                        </div>
                                        <Input
                                            id="flag"
                                            placeholder="HTB{...} or root_flag"
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
                                            "EXPLOIT"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="pt-4 border-t border-gray-800 border-dashed">
                            <div className="bg-green-950/20 border border-green-900/50 p-4 rounded text-center flex flex-col items-center gap-2">
                                <ShieldCheck className="h-8 w-8 text-green-500" />
                                <p className="text-green-500 font-mono text-sm font-bold">
                                    ROOT ACCESS CONFIRMED
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
