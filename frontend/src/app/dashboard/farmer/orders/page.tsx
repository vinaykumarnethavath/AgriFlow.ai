"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "lucide-react";
import Link from "next/link";

export default function FarmerOrdersPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/farmer/market?tab=orders");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
            <div className="p-4 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400">
                <Box className="w-10 h-10 animate-pulse" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-foreground">Opening Orders in Buy Fertilizers...</h2>
                <p className="text-sm text-muted-foreground mt-1">Orders have been merged into Buy Fertilizers for a unified experience.</p>
            </div>
            <Link 
                href="/dashboard/farmer/market?tab=orders"
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
            >
                Go to Orders & Tracking
            </Link>
        </div>
    );
}
