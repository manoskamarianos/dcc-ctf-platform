"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Code, Lock, Award, Terminal, ExternalLink, Flag } from "lucide-react";

export default function Home() {
  const [userStats, setUserStats] = useState({
    score: 0,
    rank: 'N/A',
    challengesSolved: 0,
  });
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, username: 'Player1', score: 5000 },
    { rank: 2, username: 'Player2', score: 4500 },
    { rank: 3, username: 'Player3', score: 4200 },
  ]);

  useEffect(() => {
    // Simulate fetching user stats from an API or local storage
    const fetchUserStats = async () => {
      const isLoggedIn = localStorage.getItem('authToken');

      if (isLoggedIn) {
        // Simulate API call
        setTimeout(() => {
          setUserStats({
            score: 1500,
            rank: 27,
            challengesSolved: 32,
          });
        }, 500); // Simulate delay
      } else {
        setUserStats({
          score: 0,
          rank: 'N/A',
          challengesSolved: 0,
        });
      }
    };

    const fetchLeaderboard = async () => {
      // Simulate fetching leaderboard data from backend
      setTimeout(() => {
        const leaderboardData = [
          { rank: 1, username: 'HackerAce', score: 6000 },
          { rank: 2, username: 'CodeCrusher', score: 5500 },
          { rank: 3, username: 'ByteBandit', score: 5200 },
        ];
        setLeaderboard(leaderboardData);
      }, 300); // Simulate delay
    };

    fetchUserStats();
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Flag className="mr-2" /> Welcome to CTF Daily Challenges!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Challenge Overview */}
        <Card className="transition-all hover:scale-105 duration-200 border-none bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="mr-2 text-yellow-400" size={20} />
              Today's Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-1">Challenge Title: <span className="font-medium">Decrypt the Message</span></p>
            <p className="mb-1">Category: <Badge variant="outline" className="ml-1">Cryptography</Badge></p>
            <p className="mb-1">Points: <Badge variant="secondary" className="ml-1">150</Badge></p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Accept Challenge</Button>
          </CardFooter>
        </Card>

        {/* User Statistics */}
        <Card className="border-none bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Terminal className="mr-2 text-blue-400" size={20} />
              Your Hacker Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Score:</span>
                <Badge variant="secondary" className="font-mono">{userStats.score}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Rank:</span>
                <Badge variant="secondary" className="font-mono">{userStats.rank}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Challenges Solved:</span>
                <Badge variant="secondary" className="font-mono">{userStats.challengesSolved}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-400">Keep hacking!</p>
          </CardFooter>
        </Card>

        {/* Leaderboard Snippet */}
        <Card className="border-none bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Trophy className="mr-2 text-yellow-500" size={20} />
              Top Hackers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {leaderboard.map((player) => (
                <li key={player.rank} className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <div className="flex items-center">
                    <Award className="mr-2" size={18} />
                    <span>#{player.rank} {player.username}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{player.score}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="flex items-center" asChild>
              <Link href="/leaderboard">
                View Full Leaderboard <ExternalLink className="ml-1" size={14} />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-8 text-center">
        <p className="flex items-center justify-center gap-2">
          Ready to test your skills? Head over to the 
          <Button variant="link" className="flex items-center p-0" asChild>
            <Link href="/challenges">
              Challenges <Code className="ml-1" size={16} />
            </Link>
          </Button>
          page and prove your worth!
        </p>
      </div>
    </div>
  );
}