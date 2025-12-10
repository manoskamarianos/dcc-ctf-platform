"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    ArrowLeft,
    Star,
    Download,
    FileText,
    MessageSquare,
    Send,
    Terminal,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Mock challenge data
const challengeData = {
    id: "for1",
    title: "Corrupted Image",
    description:
        "An important image file has been corrupted. Can you recover the hidden flag?",
    category: "Forensics",
    difficulty: "easy",
    points: 100,
    hints: ["Check the file headers", "Some bytes might be missing"],
    files: [{ name: "corrupted.png", size: "24KB" }],
};

export default function ChallengeDetail() {
    const params = useParams();
    const [flagInput, setFlagInput] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        // Mock submission logic
        console.log("Flag submitted:", flagInput);
        setSubmitted(true);
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/challenges">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{challengeData.title}</h1>
                <Badge className="ml-2 bg-blue-500">
                    {challengeData.category}
                </Badge>
                <div className="flex items-center ml-auto">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{challengeData.points} points</span>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Challenge Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{challengeData.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                Submit Flag
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="Enter flag in format: CTF{flag_text_here}"
                                    value={flagInput}
                                    onChange={(e) =>
                                        setFlagInput(e.target.value)
                                    }
                                    className="font-mono"
                                />
                                <Button onClick={handleSubmit}>
                                    <Send className="h-4 w-4 mr-2" /> Submit
                                </Button>
                            </div>

                            {submitted && (
                                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <p>Incorrect flag. Try again!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">
                                    Challenge Files
                                </h3>
                                {challengeData.files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 border rounded-md"
                                    >
                                        <span className="font-mono text-sm">
                                            {file.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {file.size}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Hints</h3>
                                <div className="space-y-2">
                                    {challengeData.hints.map((hint, index) => (
                                        <div
                                            key={index}
                                            className="p-2 bg-muted rounded-md text-sm"
                                        >
                                            <span className="font-semibold">
                                                Hint {index + 1}:
                                            </span>{" "}
                                            {hint}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Discussion
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Discussions are only visible after you solve the
                                challenge.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
