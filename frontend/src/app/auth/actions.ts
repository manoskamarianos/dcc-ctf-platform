"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/home");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    if (!email || !password || !username) {
        return { error: "All fields are required." };
    }

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        return { error: authError.message };
    }

    if (authData.user) {
        // 2. Create the user profile
        // Note: This requires the "Confirm Email" setting to be OFF in Supabase for immediate login
        const { error: profileError } = await supabase.from("users").insert({
            id: authData.user.id,
            username: username,
            is_admin: false,
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            if (profileError.code === "23505") {
                return { error: "Username already taken." };
            }
            return { error: "Account created, but profile setup failed." };
        }
    } else {
        return { error: "Please check your email to confirm your account." };
    }

    revalidatePath("/", "layout");
    redirect("/home");
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    // 1. Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to update your profile." };
    }

    const username = formData.get("username") as string;
    const htb_id = formData.get("htb_id") as string;
    const htb_token = formData.get("htb_token") as string; // <--- NEW: Get Token

    if (!username || username.trim().length < 3) {
        return { error: "Username must be at least 3 characters long." };
    }

    // 2. Update the profile
    const { error } = await supabase
        .from("users")
        .update({
            username: username,
            htb_id: htb_id || null,
            htb_token: htb_token || null,
        })
        .eq("id", user.id);

    if (error) {
        console.error("Update error:", error);
        if (error.code === "23505") {
            return { error: "Username is already taken by another operative." };
        }
        return { error: "Failed to update profile." };
    }

    // 3. Refresh the profile page data
    revalidatePath("/profile");
    return { success: "Profile configuration updated." };
}
