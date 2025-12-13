"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateUserFlag } from "@/lib/flag-generator";
import { submitHtbFlag } from "@/lib/htb-client";

export async function submitFlag(challengeId: string, flagInput: string) {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };

    // 2. Fetch Challenge Details
    // Include 'htb_id' to check source
    const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .select("flag_template, server_seed, is_active, title, htb_id")
        .eq("id", challengeId)
        .single();

    if (challengeError || !challenge) {
        return { error: "Challenge not found." };
    }

    if (!challenge.is_active) {
        return { error: "This challenge is currently inactive." };
    }

    // 3. Check if already solved
    const { data: existingSolve } = await supabase
        .from("solves")
        .select("id")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .single();

    if (existingSolve) {
        return { error: "You have already solved this challenge!" };
    }

    // 4. Logic Branch: HTB vs Local
    if (challenge.htb_id) {
        // --- HTB LOGIC ---
        // Get user profile for token
        const { data: profile } = await supabase
            .from("users")
            .select("htb_token")
            .eq("id", user.id)
            .single();

        if (!profile?.htb_token) {
            return {
                error: "HTB API Token missing. Please configure it in your Profile.",
            };
        }

        // Forward submission to HackTheBox
        const htbResult = await submitHtbFlag(
            profile.htb_token,
            challenge.htb_id,
            flagInput,
            "challenge",
        );

        if (!htbResult.success) {
            return {
                error: `HTB Rejected: ${htbResult.message || "Invalid flag"}`,
            };
        }

        // Success -> Record locally
        const { error: solveError } = await supabase.from("solves").insert({
            user_id: user.id,
            challenge_id: challengeId,
        });

        if (solveError) {
            return {
                error: "Flag accepted by HTB, but failed to record local solve.",
            };
        }

        revalidatePath("/challenges");
        revalidatePath("/leaderboard");
        return {
            success: true,
            message: `Correct! You pwned ${challenge.title} on HTB.`,
        };
    } else {
        // --- LOCAL LOGIC ---
        // Generate the EXPECTED flag for THIS specific user
        const expectedFlag = generateUserFlag(
            challenge.flag_template,
            challenge.server_seed,
            user.id,
        );

        // Verify Flag
        if (flagInput.trim() === expectedFlag) {
            const { error: solveError } = await supabase.from("solves").insert({
                user_id: user.id,
                challenge_id: challengeId,
            });

            if (solveError) {
                return { error: "Database error recording solve." };
            }

            revalidatePath("/challenges");
            revalidatePath("/leaderboard");
            return {
                success: true,
                message: `Correct! You solved ${challenge.title}.`,
            };
        } else {
            return { error: "Incorrect flag. Try again." };
        }
    }
}
