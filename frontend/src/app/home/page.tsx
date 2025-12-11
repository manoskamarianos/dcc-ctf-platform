"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Code,
    Lock,
    Award,
    Terminal,
    ExternalLink,
    Flag,
    Cpu,
} from "lucide-react";

export default function Home() {
    const [userStats, setUserStats] = useState({
        score: 0,
        rank: "N/A",
        challengesSolved: 0,
    });
    const [leaderboard, setLeaderboard] = useState([
        { rank: 1, username: "Player1", score: 5000 },
        { rank: 2, username: "Player2", score: 4500 },
        { rank: 3, username: "Player3", score: 4200 },
    ]);

    useEffect(() => {
        // Simulate fetching user stats
        const fetchUserStats = async () => {
            const isLoggedIn = localStorage.getItem("authToken");
            if (isLoggedIn) {
                setTimeout(() => {
                    setUserStats({
                        score: 1500,
                        rank: 27,
                        challengesSolved: 32,
                    });
                }, 500);
            } else {
                setUserStats({
                    score: 0,
                    rank: "N/A",
                    challengesSolved: 0,
                });
            }
        };

        const fetchLeaderboard = async () => {
            setTimeout(() => {
                const leaderboardData = [
                    { rank: 1, username: "HackerAce", score: 6000 },
                    { rank: 2, username: "CodeCrusher", score: 5500 },
                    { rank: 3, username: "ByteBandit", score: 5200 },
                ];
                setLeaderboard(leaderboardData);
            }, 300);
        };

        fetchUserStats();
        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-[calc(100vh-60px)] bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="container mx-auto p-6 md:p-12">
                {/* Hero Section */}
                <div className="mb-12 flex flex-col items-start border-l-4 border-terminal-green pl-6">
                    <h1 className="text-4xl md:text-5xl turret-extrabold text-white tracking-tight mb-2 uppercase drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
                        <span className="text-terminal-green">System</span>
                        .Ready
                    </h1>
                    <p className="turret-light text-gray-400 text-lg max-w-2xl">
                        Welcome to the mainframe, operative. Initialize your
                        daily sequence and compete for root access.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Daily Challenge Overview */}
                    <Card className="group bg-black/40 backdrop-blur-sm border border-terminal-green/30 hover:border-terminal-green transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-sm">
                        <CardHeader className="pb-3 border-b border-terminal-green/10">
                            <CardTitle className="flex items-center text-xl turret-bold text-white group-hover:text-terminal-green transition-colors">
                                <Lock
                                    className="mr-3 text-terminal-green animate-pulse"
                                    size={20}
                                />
                                TODAY'S_TARGET
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="turret-light text-sm text-gray-500 uppercase tracking-widest mb-1">
                                    Mission Title
                                </p>
                                <p className="turret-medium text-lg text-white">
                                    Decrypt the Message
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <div>
                                    <p className="turret-light text-xs text-gray-500 uppercase">
                                        Class
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="mt-1 border-terminal-green text-terminal-green bg-terminal-green/5 turret-regular"
                                    >
                                        Cryptography
                                    </Badge>
                                </div>
                                <div>
                                    <p className="turret-light text-xs text-gray-500 uppercase">
                                        Bounty
                                    </p>
                                    <Badge
                                        variant="secondary"
                                        className="mt-1 bg-white/10 text-white hover:bg-white/20 turret-regular"
                                    >
                                        150 PTS
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button
                                className="w-full bg-terminal-green text-black hover:bg-terminal-green/80 turret-bold tracking-wider"
                                asChild
                            >
                                <Link href="/challenges">INITIALIZE_HACK</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* User Statistics */}
                    <Card className="group bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-sm">
                        <CardHeader className="pb-3 border-b border-gray-800">
                            <CardTitle className="flex items-center text-xl turret-bold text-white group-hover:text-blue-400 transition-colors">
                                <Terminal
                                    className="mr-3 text-blue-500"
                                    size={20}
                                />
                                OPERATIVE_STATS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                    <span className="turret-light text-gray-400">
                                        Current Score
                                    </span>
                                    <span className="turret-bold text-2xl text-white font-mono">
                                        {userStats.score}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                    <span className="turret-light text-gray-400">
                                        Global Rank
                                    </span>
                                    <span className="turret-bold text-xl text-yellow-500 font-mono">
                                        #{userStats.rank}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                    <span className="turret-light text-gray-400">
                                        Systems Breached
                                    </span>
                                    <span className="turret-bold text-xl text-blue-400 font-mono">
                                        {userStats.challengesSolved}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="turret-extralight text-xs text-gray-600 w-full text-center">
                                // KEEP HACKING TO INCREASE RANK
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Leaderboard Snippet */}
                    <Card className="group bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] rounded-sm">
                        <CardHeader className="pb-3 border-b border-gray-800">
                            <CardTitle className="flex items-center text-xl turret-bold text-white group-hover:text-yellow-500 transition-colors">
                                <Trophy
                                    className="mr-3 text-yellow-500"
                                    size={20}
                                />
                                ELITE_SQUAD
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3">
                                {leaderboard.map((player, index) => (
                                    <li
                                        key={player.rank}
                                        className="flex items-center justify-between group/item"
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`mr-3 w-6 h-6 flex items-center justify-center rounded-sm turret-bold text-xs 
                                                ${
                                                    index === 0
                                                        ? "bg-yellow-500/20 text-yellow-500"
                                                        : index === 1
                                                          ? "bg-gray-400/20 text-gray-400"
                                                          : "bg-orange-700/20 text-orange-700"
                                                }`}
                                            >
                                                {player.rank}
                                            </div>
                                            <span className="turret-medium text-gray-300 group-hover/item:text-white transition-colors">
                                                {player.username}
                                            </span>
                                        </div>
                                        <span className="font-mono text-terminal-green text-sm">
                                            {player.score}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="link"
                                className="w-full text-gray-500 hover:text-terminal-green turret-regular"
                                asChild
                            >
                                <Link href="/leaderboard">
                                    VIEW_FULL_DATABASE{" "}
                                    <ExternalLink className="ml-2" size={14} />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-16 text-center border-t border-gray-900 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 turret-light text-gray-500">
                        <Cpu className="h-4 w-4" />
                        <span>Ready to deploy your skills? Access the</span>
                        <Button
                            variant="link"
                            className="p-0 h-auto text-terminal-green hover:text-white turret-bold text-lg mx-1"
                            asChild
                        >
                            <Link href="/challenges">CHALLENGE_GRID</Link>
                        </Button>
                        <span>and prove your worth.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
