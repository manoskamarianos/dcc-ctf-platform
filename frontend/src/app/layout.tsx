import type { Metadata } from "next";
import "@/scss/main.scss";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "DIT CTF",
    description: "Daily CTF Challenges Platform",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    // 1. Get the authenticated user (Auth layer)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userProfile = null;

    // 2. If user exists, get their profile (Database layer)
    if (user) {
        const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        userProfile = profile;
    }

    return (
        <html lang="en">
            <body className="bg-background text-foreground min-h-screen flex flex-col font-turret">
                {/* 3. Pass both user (auth) and profile (db) to the Header */}
                <Header user={user} profile={userProfile} />

                <main className="flex-1">{children}</main>

                <Footer />
            </body>
        </html>
    );
}
