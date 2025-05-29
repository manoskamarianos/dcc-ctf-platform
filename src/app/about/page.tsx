"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, Globe, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">About CTF Daily Challenges</h1>
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
          <CardDescription>What drives our platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            CTF Daily Challenges provides a platform for cybersecurity enthusiasts to practice
            and improve their skills through daily capture-the-flag challenges. Our goal is to 
            make security learning accessible, engaging, and fun.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Our Team
          </CardTitle>
          <CardDescription>The people behind the challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our team consists of cybersecurity professionals and educators who are passionate
            about teaching security concepts through hands-on challenges. We carefully craft
            each challenge to focus on real-world scenarios and skills.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
          <CardDescription>Participate and earn points</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sign up for an account, solve daily challenges, and earn points to climb the
            leaderboard. Challenges cover various security domains including web security,
            cryptography, reverse engineering, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}