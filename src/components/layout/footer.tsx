import React from "react";
import Link from "next/link";
import { Github, Twitter, Heart, Flag, Code } from "lucide-react";
import { Discord } from "@/components/icons/discord";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-terminal-green py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Column 1: About */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-terminal-green text-lg font-bold flex items-center gap-2">
              <Flag size={18} className="text-terminal-green" />
              CTF Daily Challenges
            </h3>
            <p className="text-gray-400 text-sm">
              Practice your cybersecurity skills with daily CTF challenges. 
              Learn, compete, and climb the leaderboard.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-terminal-green text-lg font-bold">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="link" className="justify-start text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
                <Link href="/challenges">Challenges</Link>
              </Button>
              <Button variant="link" className="justify-start text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
                <Link href="/leaderboard">Leaderboard</Link>
              </Button>
              <Button variant="link" className="justify-start text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
                <Link href="/teams">Teams</Link>
              </Button>
              <Button variant="link" className="justify-start text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
                <Link href="/faq">FAQ</Link>
              </Button>
            </div>
          </div>

          {/* Column 3: Social */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-terminal-green text-lg font-bold">Connect</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-terminal-green hover:bg-gray-900" asChild>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github size={20} />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-terminal-green hover:bg-gray-900" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-terminal-green hover:bg-gray-900" asChild>
                <Link href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  <Discord size={20} />
                  <span className="sr-only">Discord</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800 my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-terminal-green mb-4 sm:mb-0 flex items-center">
            © 2025 Dit Coding Club
            <Heart size={14} className="text-red-500 mx-1" />
          </div>
          <div className="flex space-x-4 text-sm text-gray-400">
            <Button variant="link" className="text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="link" className="text-gray-400 hover:text-terminal-green p-0 h-auto" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
