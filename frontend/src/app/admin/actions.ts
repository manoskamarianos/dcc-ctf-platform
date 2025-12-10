"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

// --- USER MANAGEMENT ---

export async function toggleUserRole(targetUserId: string, makeAdmin: boolean) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("users")
        .update({ is_admin: makeAdmin })
        .eq("id", targetUserId);

    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(targetUserId: string) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { error: "Service Role Key missing." };

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

// --- CHALLENGE MANAGEMENT ---

export async function createChallenge(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const difficulty = formData.get("difficulty") as string;
    const points = parseInt(formData.get("points") as string);
    const flag = formData.get("flag") as string;
    const file_url = formData.get("file_url") as string;

    // Check required fields
    if (!title || !description || !flag || !points) {
        return { error: "Missing required fields" };
    }

    const { error } = await supabase.from("challenges").insert({
        title,
        description,
        category,
        difficulty,
        points,
        flag,
        file_url: file_url || null,
        is_active: true, // Default to active
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/challenges");
    redirect("/admin/challenges");
}

export async function updateChallenge(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const id = formData.get("id") as string;

    const updates = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        difficulty: formData.get("difficulty") as string,
        points: parseInt(formData.get("points") as string),
        flag: formData.get("flag") as string,
        file_url: (formData.get("file_url") as string) || null,
    };

    const { error } = await supabase
        .from("challenges")
        .update(updates)
        .eq("id", id);

    if (error) return { error: error.message };

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

export async function createContest(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;

    if (!title || !start_time || !end_time) {
        return { error: "Missing required fields" };
    }

    const { error } = await supabase.from("contests").insert({
        title,
        description,
        start_time,
        end_time,
        is_active: true,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/contests");
    redirect("/admin/contests");
}

export async function updateContest(formData: FormData) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const id = formData.get("id") as string;

    const updates = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
    };

    const { error } = await supabase
        .from("contests")
        .update(updates)
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/contests");
    redirect("/admin/contests");
}

export async function deleteContest(contestId: string) {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("contests")
        .delete()
        .eq("id", contestId);

    if (error) return { error: error.message };

    revalidatePath("/admin/contests");
    return { success: true };
}
