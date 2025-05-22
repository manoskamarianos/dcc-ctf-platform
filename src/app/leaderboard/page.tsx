"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Medal, 
  Search, 
  Trophy, 
  Award, 
  ArrowUpDown, 
  Calendar, 
  Users 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const leaderboardData = [
  { rank: 1, username: "h4ckm4st3r", points: 9850, challenges: 42, streak: 14 },
  { rank: 2, username: "cyb3rpunk", points: 8720, challenges: 38, streak: 7 },
  { rank: 3, username: "secure_coder", points: 7650, challenges: 35, streak: 21 },
  { rank: 4, username: "crypto_queen", points: 6890, challenges: 30, streak: 5 },
  { rank: 5, username: "binary_ninja", points: 6540, challenges: 28, streak: 9 },
  { rank: 6, username: "exploit_master", points: 5980, challenges: 26, streak: 3 },
  { rank: 7, username: "packet_sniffer", points: 5640, challenges: 24, streak: 12 },
  { rank: 8, username: "buffer_wizard", points: 5320, challenges: 23, streak: 4 },
  { rank: 9, username: "zero_day", points: 4950, challenges: 21, streak: 8 },
  { rank: 10, username: "malware_hunter", points: 4820, challenges: 20, streak: 6 },
];

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredUsers = leaderboardData.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to render rank badges for top 3
  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return rank;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="global" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="global" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
        
        <TabsContent value="global" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top CTF Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" className="flex items-center gap-1 p-0">
                        Points
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Challenges</TableHead>
                    <TableHead className="text-right">Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center">
                          {getRankBadge(user.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {user.username}
                        {user.streak >= 7 && (
                          <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                            HOT 🔥
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {user.points.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{user.challenges}</TableCell>
                      <TableCell className="text-right">{user.streak} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Monthly Leaderboard</h3>
                <p className="text-muted-foreground mt-2">
                  Monthly rankings reset at the beginning of each month. Earn special badges for monthly achievements!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="friends">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Friends Leaderboard</h3>
                <p className="text-muted-foreground mt-2">
                  Connect with other CTF players to compare scores and compete directly with your friends.
                </p>
                <Button className="mt-4">Add Friends</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}