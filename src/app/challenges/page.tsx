"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderSearch, Code, Shield, Binary, FileDigit, Braces } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ChallengeCategory from "@/app/challenges/challenge-category";

export default function Challenges() {
    return (
        <main className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Challenges</h1>
            </div>
            
            <Separator />
            
            <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="forensics" className="flex items-center gap-1">
                            <FolderSearch className="h-4 w-4" />
                            Forensics
                        </TabsTrigger>
                        <TabsTrigger value="binary" className="flex items-center gap-1">
                            <Binary className="h-4 w-4" />
                            Binary Exploitation
                        </TabsTrigger>
                        <TabsTrigger value="crypto" className="flex items-center gap-1">
                            <FileDigit className="h-4 w-4" />
                            Cryptography
                        </TabsTrigger>
                        <TabsTrigger value="reverse" className="flex items-center gap-1">
                            <Braces className="h-4 w-4" />
                            Reverse Engineering
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="all" className="space-y-8">
                    <ChallengeCategory categoryTitle="Forensics" icon={<FolderSearch className="h-5 w-5" />} />
                    <ChallengeCategory categoryTitle="Binary Exploitation" icon={<Binary className="h-5 w-5" />} />
                    <ChallengeCategory categoryTitle="Cryptography" icon={<FileDigit className="h-5 w-5" />} />
                    <ChallengeCategory categoryTitle="Reverse Engineering" icon={<Braces className="h-5 w-5" />} />
                </TabsContent>
                
                <TabsContent value="forensics">
                    <ChallengeCategory categoryTitle="Forensics" icon={<FolderSearch className="h-5 w-5" />} />
                </TabsContent>
                
                <TabsContent value="binary">
                    <ChallengeCategory categoryTitle="Binary Exploitation" icon={<Binary className="h-5 w-5" />} />
                </TabsContent>
                
                <TabsContent value="crypto">
                    <ChallengeCategory categoryTitle="Cryptography" icon={<FileDigit className="h-5 w-5" />} />
                </TabsContent>
                
                <TabsContent value="reverse">
                    <ChallengeCategory categoryTitle="Reverse Engineering" icon={<Braces className="h-5 w-5" />} />
                </TabsContent>
            </Tabs>
        </main>
    );
}