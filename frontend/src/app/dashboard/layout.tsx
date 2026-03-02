import Sidebar from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-background min-h-screen transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 ml-64 p-8 overflow-y-auto relative bg-background">
                <div className="absolute top-4 right-4 z-10">
                    <ThemeToggle />
                </div>
                {children}
            </div>
        </div>
    );
}
