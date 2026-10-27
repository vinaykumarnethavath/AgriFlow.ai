"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FarmerOrdersPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/farmer/market?tab=orders");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Redirecting to Orders...</p>
        </div>
    );
}
