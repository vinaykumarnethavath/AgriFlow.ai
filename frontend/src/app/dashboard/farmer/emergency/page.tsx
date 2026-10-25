"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import Link from "next/link";

export default function EmergencyPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/farmer/settings?tab=emergency");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <PhoneCall className="w-10 h-10 animate-pulse" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-foreground">Opening Emergency SOS in Settings...</h2>
                <p className="text-sm text-muted-foreground mt-1">Emergency SOS has been relocated to Settings for streamlined navigation.</p>
            </div>
            <Link 
                href="/dashboard/farmer/settings?tab=emergency"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
            >
                Open Emergency SOS
            </Link>
        </div>
    );
}
