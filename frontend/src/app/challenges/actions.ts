"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateUserFlag } from "@/lib/flag-generator";

export async function submitFlag(challengeId: string, flagInput: string) {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };

    // 2. Fetch Challenge Details
    // Note: We select flag_template and server_seed instead of 'flag'
    const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .select("flag_template, server_seed, is_active, title")
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

    // 4. Generate the EXPECTED flag for THIS specific user
    const expectedFlag = generateUserFlag(
        challenge.flag_template,
        challenge.server_seed,
        user.id,
    );

    // 5. Verify Flag
    if (flagInput.trim() === expectedFlag) {
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
