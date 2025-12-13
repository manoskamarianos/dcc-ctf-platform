"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveChallenges } from "@/lib/htb-client";

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

// --- SYNC ACTION ---

export async function syncHtbChallenges() {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const systemToken = process.env.HTB_SYSTEM_TOKEN;
    if (!systemToken) {
        return {
            error: "HTB_SYSTEM_TOKEN is missing in server environment variables.",
        };
    }

    // 1. Fetch from HTB API
    const htbChallenges = await getActiveChallenges(systemToken);

    if (!htbChallenges || htbChallenges.length === 0) {
        return { error: "No challenges found via API." };
    }

    const supabase = await createClient();
    let count = 0;

    // 2. Upsert into Supabase
    for (const c of htbChallenges) {
        const safeDescription = c.description || "No description provided.";
        const safeCategory = c.category_name || "Uncategorized";
        const safeDifficulty = c.difficulty || "Medium";

        let fileUrl = null;
        if (c.download && c.sha256) {
            fileUrl = `https://labs.hackthebox.com/storage/challenges/${c.id}/${c.sha256}.zip`;
        }

        const { error } = await supabase.from("challenges").upsert(
            {
                title: c.name,
                description: safeDescription,
                category: safeCategory,
                difficulty: safeDifficulty,
                points: c.points,
                flag_template: "HTB_MANAGED",
                server_seed: crypto.randomUUID(),
                file_url: fileUrl, // <--- Saved here
                htb_id: c.id,
                is_active: true,
            },
            { onConflict: "htb_id" },
        );

        if (!error) count++;
        else console.error(`Upsert failed for ${c.name}: ${error.message}`);
    }

    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");

    return {
        success: true,
        message: `Sync Complete: Updated ${count} challenges from HackTheBox.`,
    };
}

// --- PURGE ACTION ---
export async function purgeAllChallenges() {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    // Delete all except nil UUID (safe delete for all rows)
    const { error, count } = await supabase
        .from("challenges")
        .delete({ count: "exact" })
        .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) return { error: error.message };

    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");

    return {
        success: true,
        message: `Purge Complete: Deleted ${count} challenges.`,
    };
}

// ... (Keep the other CRUD actions: createChallenge, updateChallenge, etc.)
export async function createChallenge(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const difficulty = formData.get("difficulty") as string;
    const points = parseInt(formData.get("points") as string);
    const flag_template = formData.get("flag") as string;
    const file_url = formData.get("file_url") as string;
    const hints = formData.getAll("hints") as string[];

    if (!title || !description || !flag_template || !points) {
        return { error: "Missing required fields" };
    }

    const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
            title,
            description,
            category,
            difficulty,
            points,
            flag_template,
            server_seed: crypto.randomUUID(),
            file_url: file_url || null,
            is_active: true,
            htb_id: null,
        })
        .select()
        .single();

    if (error) return { error: error.message };

    const validHints = hints.filter((h) => h.trim() !== "");
    if (validHints.length > 0 && challenge) {
        const hintRows = validHints.map((content) => ({
            challenge_id: challenge.id,
            content: content,
        }));
        await supabase.from("hints").insert(hintRows);
    }

    revalidatePath("/admin/challenges");
    redirect("/admin/challenges");
}

export async function updateChallenge(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const id = formData.get("id") as string;
    const hints = formData.getAll("hints") as string[];

    const updates = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        difficulty: formData.get("difficulty") as string,
        points: parseInt(formData.get("points") as string),
        flag_template: formData.get("flag") as string,
        file_url: (formData.get("file_url") as string) || null,
    };

    const { error } = await supabase
        .from("challenges")
        .update(updates)
        .eq("id", id);

    if (error) return { error: error.message };

    await supabase.from("hints").delete().eq("challenge_id", id);

    const validHints = hints.filter((h) => h.trim() !== "");
    if (validHints.length > 0) {
        const hintRows = validHints.map((content) => ({
            challenge_id: id,
            content: content,
        }));
        await supabase.from("hints").insert(hintRows);
    }

    revalidatePath("/admin/challenges");
    redirect("/admin/challenges");
}

export async function toggleChallengeStatus(
    challengeId: string,
    isActive: boolean,
) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("challenges")
        .update({ is_active: isActive })
        .eq("id", challengeId);

    if (error) return { error: error.message };

    revalidatePath("/admin/challenges");
    return { success: true };
}

export async function deleteChallenge(challengeId: string) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);

    if (error) return { error: error.message };

    revalidatePath("/admin/challenges");
    return { success: true };
}
