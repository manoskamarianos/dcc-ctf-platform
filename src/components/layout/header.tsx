"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Flag, 
  Trophy, 
  Users, 
  LogIn, 
  UserPlus, 
  Menu 
} from "lucide-react";
import "@/scss/components/header.component.scss";

export default function Header() {
  const [isFullPage, setIsFullPage] = useState(typeof window !== "undefined" && window.innerWidth > 1024);

  const checkScreenSize = () => {
    setIsFullPage(window.innerWidth > 1024);
  };

  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header className="bg-black h-[60px] border-b-2 border-terminal-green">
      <nav className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="flex gap-4 items-center">
          <Link href="/home" className="flex items-center">
            <div className="flex justify-center items-center h-[40px] w-[60px] text-xs">
              <Flag className="text-terminal-green h-8 w-8" />
            </div>
            <span className="hidden sm:block text-terminal-green text-xl font-medium">CTF Daily</span>
          </Link>
          
          <div className="hidden md:flex text-terminal-green text-lg gap-2 items-center font-medium">
            <Link href="/home" className="flex items-center gap-1 p-2 hover:bg-gray-900 rounded-md transition-colors">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link href="/challenges" className="flex items-center gap-1 p-2 hover:bg-gray-900 rounded-md transition-colors">
              <Flag size={18} />
              <span>Challenges</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-1 p-2 hover:bg-gray-900 rounded-md transition-colors">
              <Trophy size={18} />
              <span>Leaderboard</span>
            </Link>
            <Link href="/teams" className="flex items-center gap-1 p-2 hover:bg-gray-900 rounded-md transition-colors">
              <Users size={18} />
              <span>Teams</span>
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex text-terminal-green text-lg gap-2 items-center font-medium">
          <Button variant="ghost" className="text-terminal-green hover:text-white flex items-center gap-1" asChild>
            <Link href="/login">
              <LogIn size={18} />
              <span>Log In</span>
            </Link>
          </Button>
          <Button variant="outline" className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black flex items-center gap-1" asChild>
            <Link href="/register">
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </Button>
        </div>
        
        {!isFullPage && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-terminal-green">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-black border-l-2 border-terminal-green">
              <div className="flex flex-col text-terminal-green text-xl gap-4 mt-8">
                <Link href="/home" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link href="/challenges" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <Flag size={20} />
                  <span>Challenges</span>
                </Link>
                <Link href="/leaderboard" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <Trophy size={20} />
                  <span>Leaderboard</span>
                </Link>
                <Link href="/teams" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <Users size={20} />
                  <span>Teams</span>
                </Link>
                <div className="border-t border-gray-800 my-2"></div>
                <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <LogIn size={20} />
                  <span>Log In</span>
                </Link>
                <Link href="/register" className="flex items-center gap-2 p-2 hover:bg-gray-900 rounded-md transition-colors">
                  <UserPlus size={20} />
                  <span>Register</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  );
}