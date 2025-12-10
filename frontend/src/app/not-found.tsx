import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, HomeIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
    return (
        <main className="bg-black flex justify-center items-center min-h-screen">
            <Card className="border-terminal-green bg-black/80 max-w-md w-full">
                <CardContent className="flex flex-col items-center justify-center text-terminal-green gap-6 p-8">
                    <div className="flex items-center justify-center gap-4">
                        <AlertTriangle className="h-16 w-16 text-terminal-green animate-pulse" />
                        <h1 className="font-mono font-extrabold text-[150px] leading-none">
                            404
                        </h1>
                    </div>

                    <Separator className="bg-terminal-green/30" />

                    <div className="text-center space-y-4">
                        <p className="text-xl font-mono">
                            ACCESS DENIED: Target resource not found in system
                        </p>
                        <p className="text-md opacity-80">
                            Oops... It seems that you wandered into restricted
                            territory.
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="border-terminal-green text-terminal-green hover:bg-terminal-green/10 hover:text-terminal-green"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <HomeIcon className="h-4 w-4" />
                            Return to Base
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
