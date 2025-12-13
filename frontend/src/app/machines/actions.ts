"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { submitHtbFlag } from "@/lib/htb-client";

export async function submitMachineFlag(machineId: string, flagInput: string) {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };

    // 2. Get User Profile (to retrieve HTB Token)
    const { data: profile } = await supabase
        .from("users")
        .select("htb_token")
        .eq("id", user.id)
        .single();

    // 3. Get Machine Details
    const { data: machine, error: machError } = await supabase
        .from("machines")
        .select("*")
        .eq("id", machineId)
        .single();

    if (machError || !machine) {
        return { error: "Target machine not found." };
    }

    if (!machine.is_active) {
        return { error: "This machine is currently inactive." };
    }

    // 4. Check if already owned
    const { data: existingSolve } = await supabase
        .from("machine_solves")
        .select("id")
        .eq("user_id", user.id)
        .eq("machine_id", machineId)
        .single();

    if (existingSolve) {
        return { error: "You have already owned this machine!" };
    }

    // 5. Logic Branch: Is this an HTB Machine or Local?
    if (machine.htb_id) {
        // --- HTB LOGIC ---
        if (!profile?.htb_token) {
            return {
                error: "HTB API Token missing. Please configure it in your Profile.",
            };
        }

        // Forward submission to HackTheBox
        const htbResult = await submitHtbFlag(
            profile.htb_token,
            machine.htb_id,
            flagInput,
            "machine",
        );

        if (!htbResult.success) {
            return {
                error: `HTB Rejected: ${htbResult.message || "Invalid flag"}`,
            };
        }

        // Success on HTB -> Record locally
        const { error: solveError } = await supabase
            .from("machine_solves")
            .insert({
                user_id: user.id,
                machine_id: machineId,
            });

        if (solveError) {
            return {
                error: "Flag accepted by HTB, but failed to record local solve.",
            };
        }

        revalidatePath("/machines");
        return {
            success: true,
            message: `System PWNED! Verified by HackTheBox.`,
        };
    } else {
        // --- LOCAL LOGIC ---
        // For local machines, we check the 'flag' column in the DB
        if (!machine.flag) {
            return {
                error: "System Error: No flag configured for this local machine.",
            };
        }

        if (flagInput.trim() === machine.flag.trim()) {
            const { error: solveError } = await supabase
                .from("machine_solves")
                .insert({
                    user_id: user.id,
                    machine_id: machineId,
                });

            if (solveError) {
                return { error: "Database error recording solve." };
            }

            revalidatePath("/machines");
            return { success: true, message: "Root access granted." };
        } else {
            return { error: "Incorrect flag." };
        }
    }
}
