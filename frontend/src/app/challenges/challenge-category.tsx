"use client";

import { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Flag } from "lucide-react";

type ChallengeCategoryProps = {
    categoryTitle: string;
    icon?: ReactNode;
};

type Challenge = {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
    solved: boolean;
};

// Mock challenges data
const challenges: Record<string, Challenge[]> = {
    Forensics: [
        {
            id: "for1",
            title: "Corrupted Image",
            difficulty: "easy",
            points: 100,
            solved: true,
        },
        {
            id: "for2",
            title: "Memory Dump Analysis",
            difficulty: "medium",
            points: 250,
            solved: false,
        },
        {
            id: "for3",
            title: "Network Packet Investigation",
            difficulty: "hard",
            points: 400,
            solved: false,
        },
    ],
    "Binary Exploitation": [
        {
            id: "bin1",
            title: "Buffer Overflow 101",
            difficulty: "easy",
            points: 150,
            solved: false,
        },
        {
            id: "bin2",
            title: "Return-Oriented Programming",
            difficulty: "hard",
            points: 450,
            solved: false,
        },
    ],
    Cryptography: [
        {
            id: "cry1",
            title: "Classic Ciphers",
            difficulty: "easy",
            points: 100,
            solved: true,
        },
        {
            id: "cry2",
            title: "RSA Basics",
            difficulty: "medium",
            points: 200,
            solved: false,
        },
        {
            id: "cry3",
            title: "Hash Collisions",
            difficulty: "medium",
            points: 250,
            solved: false,
        },
    ],
    "Reverse Engineering": [
        {
            id: "rev1",
            title: "Assembly Basics",
            difficulty: "easy",
            points: 125,
            solved: false,
        },
        {
            id: "rev2",
            title: "Android APK Analysis",
            difficulty: "medium",
            points: 275,
            solved: false,
        },
        {
            id: "rev3",
            title: "Obfuscated JavaScript",
            difficulty: "medium",
            points: 225,
            solved: true,
        },
        {
            id: "rev4",
            title: "Firmware Reversing",
            difficulty: "hard",
            points: 500,
            solved: false,
        },
    ],
};

// Helper function to get the color for difficulty badges
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case "easy":
            return "bg-green-500 hover:bg-green-600";
        case "medium":
            return "bg-yellow-500 hover:bg-yellow-600";
        case "hard":
            return "bg-red-500 hover:bg-red-600";
        default:
            return "bg-blue-500 hover:bg-blue-600";
    }
};

export default function ChallengeCategory({
    categoryTitle,
    icon,
}: ChallengeCategoryProps) {
    const categoryChallenges = challenges[categoryTitle] || [];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {categoryTitle}
                </CardTitle>
                <CardDescription>
                    {categoryChallenges.length} challenges available
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {categoryChallenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {challenge.title}
                                    </span>
                                    {challenge.solved && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-500 text-green-500"
                                        >
                                            <Flag className="mr-1 h-3 w-3" />{" "}
                                            Solved
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge
                                        className={getDifficultyColor(
                                            challenge.difficulty,
                                        )}
                                    >
                                        {challenge.difficulty}
                                    </Badge>
                                    <span className="flex items-center">
                                        <Star className="mr-1 h-3 w-3 text-yellow-500" />
                                        {challenge.points} pts
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex items-center gap-1"
                            >
                                Solve <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
