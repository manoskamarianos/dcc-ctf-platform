"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitFlag(challengeId: string, flagInput: string) {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };

    // 2. Fetch Challenge Details (specifically the real flag)
    const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .select("flag, is_active, title")
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

    // 4. Verify Flag (Trim whitespace and simple string comparison)
    if (flagInput.trim() === challenge.flag) {
        // Correct! Insert solve
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
