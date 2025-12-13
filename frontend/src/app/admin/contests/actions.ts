"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper: Verify Admin
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

export async function createContestWithItems(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;

    // Parse the JSON arrays of IDs sent from the client
    const challengeIds = JSON.parse(
        (formData.get("challenge_ids") as string) || "[]",
    );
    const machineIds = JSON.parse(
        (formData.get("machine_ids") as string) || "[]",
    );

    if (!title || !start_time || !end_time) {
        return { error: "Missing required fields" };
    }

    // 1. Insert Contest
    const { data: contest, error } = await supabase
        .from("contests")
        .insert({
            title,
            description,
            start_time,
            end_time,
            is_active: true,
        })
        .select()
        .single();

    if (error) return { error: error.message };

    // 2. Insert Contest Items (Machines & Challenges)
    const items = [];
    for (const cid of challengeIds) {
        items.push({
            contest_id: contest.id,
            challenge_id: cid,
            machine_id: null,
        });
    }
    for (const mid of machineIds) {
        items.push({
            contest_id: contest.id,
            challenge_id: null,
            machine_id: mid,
        });
    }

    if (items.length > 0) {
        const { error: itemsError } = await supabase
            .from("contest_items")
            .insert(items);

        if (itemsError) {
            console.error("Error adding items to contest:", itemsError);
            // We don't abort, but we log it. The contest exists, just empty items.
        }
    }

    revalidatePath("/admin/contests");
    redirect("/admin/contests");
}

export async function updateContestWithItems(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const id = formData.get("id") as string;

    const challengeIds = JSON.parse(
        (formData.get("challenge_ids") as string) || "[]",
    );
    const machineIds = JSON.parse(
        (formData.get("machine_ids") as string) || "[]",
    );

    // 1. Update Contest Details
    const { error } = await supabase
        .from("contests")
        .update({
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            start_time: formData.get("start_time") as string,
            end_time: formData.get("end_time") as string,
        })
        .eq("id", id);

    if (error) return { error: error.message };

    // 2. Sync Items: Delete old ones -> Insert new ones
    // This ensures we don't have stale links
    const { error: deleteError } = await supabase
        .from("contest_items")
        .delete()
        .eq("contest_id", id);

    if (deleteError) console.error("Error clearing old items", deleteError);

    const items = [];
    for (const cid of challengeIds) {
        items.push({ contest_id: id, challenge_id: cid, machine_id: null });
    }
    for (const mid of machineIds) {
        items.push({ contest_id: id, challenge_id: null, machine_id: mid });
    }

    if (items.length > 0) {
        const { error: itemsError } = await supabase
            .from("contest_items")
            .insert(items);
        if (itemsError) return { error: itemsError.message };
    }

    revalidatePath("/admin/contests");
    redirect("/admin/contests");
}
