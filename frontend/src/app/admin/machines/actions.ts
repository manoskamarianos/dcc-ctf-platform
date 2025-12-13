"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveMachines } from "@/lib/htb-client";

// --- HELPER: Admin Check ---
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

// --- SYNC ACTIONS ---

export async function syncHtbMachines() {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const systemToken = process.env.HTB_SYSTEM_TOKEN;
    if (!systemToken) {
        return {
            error: "HTB_SYSTEM_TOKEN is missing in server environment variables.",
        };
    }

    // 1. Fetch from HTB API
    const htbMachines = await getActiveMachines(systemToken);

    if (!htbMachines || htbMachines.length === 0) {
        return { error: "No active machines found or API failure." };
    }

    const supabase = await createClient();
    let count = 0;

    // 2. Upsert into Supabase
    for (const m of htbMachines) {
        const { error } = await supabase.from("machines").upsert(
            {
                title: m.name,
                os: m.os,
                difficulty: m.difficulty_text, // Mapped from difficultyText
                points: m.points || 20, // Default to 20 if null
                avatar_url: m.avatar,
                htb_id: m.id,
                is_active: true,
                // Note: HTB machines don't have local flags
            },
            { onConflict: "htb_id" },
        );

        if (!error) count++;
        else console.error(`Failed to sync machine ${m.name}: ${error.message}`);
    }

    revalidatePath("/admin/machines");
    revalidatePath("/machines");
    return {
        success: true,
        message: `Synced ${count} machines from HackTheBox.`,
    };
}

// --- PURGE ACTION ---

export async function purgeAllMachines() {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    // Safe delete all rows (where id != nil uuid)
    const { error, count } = await supabase
        .from("machines")
        .delete({ count: "exact" })
        .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
        console.error("Purge error:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/machines");
    revalidatePath("/machines");

    return {
        success: true,
        message: `Purge Complete: Deleted ${count} machines.`,
    };
}

// ... (Keep existing CRUD actions: createLocalMachine, updateMachine, etc.) ...
export async function createLocalMachine(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const os = formData.get("os") as string;
    const difficulty = formData.get("difficulty") as string;
    const points = parseInt(formData.get("points") as string);
    const flag = formData.get("flag") as string;
    const avatar_url = formData.get("avatar_url") as string;

    if (!title || !flag) {
        return { error: "Title and Flag are required for local machines." };
    }

    const { error } = await supabase.from("machines").insert({
        title,
        os,
        difficulty,
        points,
        flag, // Local flag storage
        avatar_url: avatar_url || null,
        htb_id: null, // Explicitly null for local
        is_active: true,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/machines");
    redirect("/admin/machines");
}

export async function updateMachine(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const id = formData.get("id") as string;

    const updates = {
        title: formData.get("title") as string,
        os: formData.get("os") as string,
        difficulty: formData.get("difficulty") as string,
        points: parseInt(formData.get("points") as string),
        flag: (formData.get("flag") as string) || null,
        avatar_url: (formData.get("avatar_url") as string) || null,
    };

    const { error } = await supabase
        .from("machines")
        .update(updates)
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/machines");
    redirect("/admin/machines");
}

export async function toggleMachineStatus(
    machineId: string,
    isActive: boolean,
) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("machines")
        .update({ is_active: isActive })
        .eq("id", machineId);

    if (error) return { error: error.message };

    revalidatePath("/admin/machines");
    return { success: true };
}

export async function deleteMachine(machineId: string) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("machines")
        .delete()
        .eq("id", machineId);

    if (error) return { error: error.message };

    revalidatePath("/admin/machines");
    return { success: true };
}