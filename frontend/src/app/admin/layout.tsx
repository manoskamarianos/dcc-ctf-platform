import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Flag,
    Trophy,
    LogOut,
    ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Check Auth
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Check Admin Status in Database
    const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    // If not admin, kick them out
    if (!profile || !profile.is_admin) {
        redirect("/home");
    }

    // Navigation Items
    const navItems = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
        },
        {
            href: "/admin/users",
            label: "User Management",
            icon: <Users size={20} />,
        },
        {
            href: "/admin/challenges",
            label: "Challenges",
            icon: <Flag size={20} />,
        },
        {
            href: "/admin/contests",
            label: "Contests",
            icon: <Trophy size={20} />,
        },
    ];

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-950/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center gap-2 text-red-500">
                    <ShieldAlert />
                    <span className="font-bold font-mono text-lg tracking-wider">
                        ADMIN_PANEL
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm"
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-gray-400 border-gray-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900"
                        asChild
                    >
                        <Link href="/home">
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit Panel
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-black">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
