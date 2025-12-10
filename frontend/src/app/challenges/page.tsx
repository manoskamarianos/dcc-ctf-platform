import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ChallengeGrid from "./challenge-grid";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function ChallengesPage() {
    const supabase = await createClient();

    // 1. Get User
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 2. Fetch Active Challenges (excluding the actual flag column for security)
    const { data: challenges } = await supabase
        .from("challenges")
        .select(
            "id, title, category, difficulty, points, description, file_url",
        )
        .eq("is_active", true)
        .order("points", { ascending: true });

    // 3. Fetch User's Solves
    const { data: solves } = await supabase
        .from("solves")
        .select("challenge_id")
        .eq("user_id", user.id);

    const solvedIds = new Set(solves?.map((s) => s.challenge_id));

    // 4. Group by Category
    const categories = ["Web", "Crypto", "Pwn", "Forensics", "Reverse", "Misc"];

    // Merge solved status into challenge objects
    const challengesWithStatus =
        challenges?.map((c) => ({
            ...c,
            solved: solvedIds.has(c.id),
        })) || [];

    return (
        <main className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-terminal-green" />
                <h1 className="text-3xl font-bold font-mono">MISSION_LOG</h1>
            </div>

            <Separator className="bg-gray-800" />

            <Tabs defaultValue="all" className="w-full">
                <div className="flex overflow-auto pb-2 mb-4">
                    <TabsList className="bg-gray-900 border border-gray-800">
                        <TabsTrigger value="all">All Missions</TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger key={cat} value={cat}>
                                {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="all">
                    <ChallengeGrid challenges={challengesWithStatus} />
                </TabsContent>

                {categories.map((cat) => (
                    <TabsContent key={cat} value={cat}>
                        <ChallengeGrid
                            challenges={challengesWithStatus.filter(
                                (c) => c.category === cat,
                            )}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </main>
    );
}
