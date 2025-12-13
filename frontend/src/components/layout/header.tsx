"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Home,
    Flag,
    Trophy,
    LogIn,
    UserPlus,
    Menu,
    LogOut,
    User as UserIcon,
    ShieldAlert,
    Server,
    Swords, // Icon for Contests
} from "lucide-react";
import "@/scss/components/_header.scss";
import { signout } from "@/app/auth/actions";

interface UserProfile {
    username: string;
    is_admin: boolean;
    htb_id?: string;
}

interface HeaderProps {
    user?: User | null;
    profile?: UserProfile | null;
}

export default function Header({ user, profile }: HeaderProps) {
    const [isFullPage, setIsFullPage] = useState(true);

    const displayName = profile?.username || user?.email || "Hacker";
    const isAdmin = profile?.is_admin || false;

    const checkScreenSize = () => {
        setIsFullPage(window.innerWidth > 1024);
    };

    useEffect(() => {
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <header className="bg-black h-[60px] border-b border-terminal-green/50 sticky top-0 z-50 backdrop-blur-sm bg-black/90">
            <nav className="container mx-auto flex justify-between items-center h-full px-4">
                {/* Logo Section */}
                <div className="flex gap-6 items-center">
                    <Link
                        href={user ? "/home" : "/"}
                        className="flex items-center gap-2 group"
                    >
                        <div className="flex justify-center items-center h-8 w-8 text-terminal-green transition-transform group-hover:rotate-12">
                            <Flag className="h-6 w-6" />
                        </div>
                        <span className="hidden sm:block text-terminal-green text-xl font-bold tracking-wider font-mono">
                            CTF_DAILY
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex text-gray-300 text-sm gap-1 items-center font-mono">
                        <Link
                            href="/home"
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-all"
                        >
                            <Home size={16} />
                            <span>DASHBOARD</span>
                        </Link>
                        <Link
                            href="/challenges"
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-all"
                        >
                            <Flag size={16} />
                            <span>CHALLENGES</span>
                        </Link>
                        <Link
                            href="/machines"
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-all"
                        >
                            <Server size={16} />
                            <span>MACHINES</span>
                        </Link>
                        <Link
                            href="/contests"
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-all"
                        >
                            <Swords size={16} />
                            <span>CONTESTS</span>
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-all"
                        >
                            <Trophy size={16} />
                            <span>LEADERBOARD</span>
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-all"
                            >
                                <ShieldAlert size={16} />
                                <span>ADMIN</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center font-mono">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-sm text-terminal-green hover:underline decoration-dashed underline-offset-4"
                            >
                                <div className="bg-terminal-green/10 p-1.5 rounded-full">
                                    <UserIcon size={14} />
                                </div>
                                <span className="max-w-[150px] truncate font-bold">
                                    {displayName}
                                </span>
                            </Link>

                            <div className="h-4 w-px bg-gray-800"></div>

                            <form action={signout}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white hover:bg-red-900/20 flex items-center gap-2 h-8"
                                >
                                    <LogOut size={14} />
                                    <span>EXIT</span>
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-white hover:bg-gray-800 font-mono text-xs"
                                asChild
                            >
                                <Link href="/login">
                                    <LogIn size={14} className="mr-2" />
                                    LOGIN
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black font-mono text-xs h-9"
                                asChild
                            >
                                <Link href="/register">
                                    <UserPlus size={14} className="mr-2" />
                                    REGISTER
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {!isFullPage && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-terminal-green hover:bg-terminal-green/10"
                            >
                                <Menu size={24} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-black border-l border-terminal-green w-[300px] p-0">
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b border-gray-800">
                                    <h2 className="text-terminal-green font-mono text-xl font-bold flex items-center gap-2">
                                        <Flag className="h-5 w-5" /> MENU
                                    </h2>
                                </div>

                                <div className="flex-1 flex flex-col gap-2 p-4 font-mono text-lg">
                                    <Link
                                        href="/home"
                                        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-colors"
                                    >
                                        <Home size={20} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        href="/challenges"
                                        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-colors"
                                    >
                                        <Flag size={20} />
                                        <span>Challenges</span>
                                    </Link>
                                    <Link
                                        href="/machines"
                                        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-colors"
                                    >
                                        <Server size={20} />
                                        <span>Machines</span>
                                    </Link>
                                    <Link
                                        href="/contests"
                                        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-colors"
                                    >
                                        <Swords size={20} />
                                        <span>Contests</span>
                                    </Link>
                                    <Link
                                        href="/leaderboard"
                                        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-terminal-green/10 hover:text-terminal-green rounded-md transition-colors"
                                    >
                                        <Trophy size={20} />
                                        <span>Leaderboard</span>
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/10 rounded-md transition-colors"
                                        >
                                            <ShieldAlert size={20} />
                                            <span>Admin Panel</span>
                                        </Link>
                                    )}
                                </div>

                                <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                                    {user ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-2 rounded-md bg-black border border-gray-800">
                                                <div className="bg-terminal-green/20 p-2 rounded-full">
                                                    <UserIcon
                                                        size={16}
                                                        className="text-terminal-green"
                                                    />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-terminal-green font-bold text-sm truncate">
                                                        {displayName}
                                                    </span>
                                                    <span className="text-gray-500 text-xs truncate">
                                                        Online
                                                    </span>
                                                </div>
                                            </div>
                                            <form action={signout}>
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    className="w-full font-mono"
                                                >
                                                    <LogOut
                                                        size={16}
                                                        className="mr-2"
                                                    />{" "}
                                                    DISCONNECT
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="secondary"
                                                className="font-mono text-xs"
                                                asChild
                                            >
                                                <Link href="/login">LOGIN</Link>
                                            </Button>
                                            <Button
                                                className="bg-terminal-green text-black hover:bg-terminal-green/80 font-mono text-xs"
                                                asChild
                                            >
                                                <Link href="/register">
                                                    JOIN
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </nav>
        </header>
    );
}
