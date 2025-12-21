"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    getUserChallengeProgress,
    getUserMachineProgress,
} from "@/lib/htb-client";

// Helper: Verify Admin Access
async function requireAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return profile?.is_admin === true;
}

/**
 * Syncs a specific user's HTB progress (Challenges & Machines) into the local database.
 * Can only be executed by an Admin.
 */
export async function syncTargetUserProgress(targetUserId: string) {
    // 1. Security Check
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized: Admin access required." };

    const supabase = await createClient();

    // 2. Fetch Target User's HTB Config
    // We fetch their stored token. If they don't have one, we can try falling back
    // to the System Token (works if their HTB profile is Public).
    const { data: targetProfile, error: profileError } = await supabase
        .from("users")
        .select("username, htb_id, htb_token")
        .eq("id", targetUserId)
        .single();

    if (profileError || !targetProfile) {
        return { error: "Target user profile not found." };
    }

    if (!targetProfile.htb_id) {
        return {
            error: `User ${targetProfile.username} does not have an HTB ID linked.`,
        };
    }

    // Determine which token to use for the API call
    // Priority: User's Personal Token -> System Token
    const apiToken = targetProfile.htb_token || process.env.HTB_SYSTEM_TOKEN;

    if (!apiToken) {
        return {
            error: "No API Token available (User has no token & System token missing).",
        };
    }

    try {
        // 3. Fetch Data from HTB API
        const [htbChallenges, htbMachines] = await Promise.all([
            getUserChallengeProgress(apiToken, targetProfile.htb_id),
            getUserMachineProgress(apiToken, targetProfile.htb_id),
        ]);

        console.log(`Sync: Found ${htbChallenges.length} challenges and ${htbMachines.length} machines for user ${targetProfile.username}`);

        if (htbChallenges.length === 0 && htbMachines.length === 0) {
            return {
                success: true,
                message: `Sync finished for ${targetProfile.username}, but no solves were returned. (Check if profile is Public or Token is valid)`,
            };
        }

        let newChallengeSolves = 0;
        let newMachineSolves = 0;

        // 4. SYNC CHALLENGES
        if (htbChallenges.length > 0) {
            const htbSolvedIds = htbChallenges.map((c) => c.id);

            // Find local challenges that match these HTB IDs
            const { data: matchingLocalChallenges } = await supabase
                .from("challenges")
                .select("id, htb_id")
                .in("htb_id", htbSolvedIds);

            if (matchingLocalChallenges && matchingLocalChallenges.length > 0) {
                const solveRows = matchingLocalChallenges.map((local) => ({
                    user_id: targetUserId,
                    challenge_id: local.id,
                }));

                const { error: challError } = await supabase
                    .from("solves")
                    .upsert(solveRows, {
                        onConflict: "user_id, challenge_id",
                        ignoreDuplicates: true,
                    });

                if (!challError) newChallengeSolves = solveRows.length;
            }
        }

        // 5. SYNC MACHINES
        if (htbMachines.length > 0) {
            const htbOwnedIds = htbMachines.map((m) => m.id);

            // Find local machines that match these HTB IDs
            const { data: matchingLocalMachines } = await supabase
                .from("machines")
                .select("id, htb_id")
                .in("htb_id", htbOwnedIds);

            if (matchingLocalMachines && matchingLocalMachines.length > 0) {
                const machineRows = matchingLocalMachines.map((local) => ({
                    user_id: targetUserId,
                    machine_id: local.id,
                }));

                const { error: machineError } = await supabase
                    .from("machine_solves")
                    .upsert(machineRows, {
                        onConflict: "user_id, machine_id",
                        ignoreDuplicates: true,
                    });

                if (!machineError) newMachineSolves = machineRows.length;
            }
        }

        revalidatePath("/admin/users");
        revalidatePath("/leaderboard");

        return {
            success: true,
            message: `Synced ${targetProfile.username}: Processed ${htbChallenges.length} challenges & ${htbMachines.length} machines.`,
        };
    } catch (error) {
        console.error("Sync Error:", error);
        return {
            error: "Failed to communicate with HackTheBox API during sync.",
        };
    }
}