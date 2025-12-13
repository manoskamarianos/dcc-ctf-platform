import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "@/scss/main.scss";

export const metadata = {
    title: "DCC CTF Platform",
    description: "Daily Challenges & CTF Platform",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Fetch user data for the Header (but DO NOT redirect here)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from("users")
            .select("username, is_admin, htb_id")
            .eq("id", user.id)
            .single();
        profile = data;
    }

    return (
        <html lang="en" className="dark">
            <body className="min-h-screen flex flex-col bg-black text-foreground">
                <Header user={user} profile={profile} />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}