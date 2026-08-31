"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Sprout,
    ShoppingBag,
    Factory,
    LineChart,
    LogOut,
    ShoppingCart,
    Sun,
    PackageSearch,
    Box,
    Store,
    TrendingUp,
    TrendingDown,
    User,
    Settings,
    Wallet,
    ClipboardList,
    BarChart2,
    MessageSquare,
    Droplets,
    Video,
    Lightbulb,
    Brain,
    ShieldCheck,
    Menu,
    ChevronLeft
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import { LanguageSelector } from "../LanguageSelector";

interface SidebarProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen = true, setIsOpen }: SidebarProps) => {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { t } = useLanguage();

    const getNavItems = () => {
        if (!user) return [];

        switch (user.role) {
            case UserRole.FARMER:
                return [
                    { name: t("sidebar.dashboard"), href: "/dashboard/farmer", icon: LayoutDashboard },
                    { name: t("sidebar.myCrops"), href: "/dashboard/farmer/crops", icon: Sprout },
                    { name: t("sidebar.buyFertilizers"), href: "/dashboard/farmer/market", icon: ShoppingBag },
                    { name: t("sidebar.marketPrices"), href: "/dashboard/farmer/market-prices", icon: TrendingUp },
                    { name: t("sidebar.weather"), href: "/dashboard/farmer/weather", icon: Sun },
                    { name: t("sidebar.farmerNews", "Farmer News"), href: "/dashboard/farmer/news", icon: PackageSearch },
                    { name: t("sidebar.communityHub", "Community Hub"), href: "/dashboard/farmer/community", icon: MessageSquare },
                    { name: t("sidebar.nutrition", "Precision Nutrition"), href: "/dashboard/farmer/nutrition", icon: Droplets },
                    { name: t("sidebar.learning", "Learning Hub"), href: "/dashboard/farmer/learning", icon: Video },
                ];
            case UserRole.SHOP:
                return [
                    { name: t("sidebar.dashboard"), href: "/dashboard/shop", icon: LayoutDashboard },
                    { name: t("sidebar.inventory"), href: "/dashboard/shop/inventory", icon: PackageSearch },
                    { name: t("sidebar.orders"), href: "/dashboard/shop/orders", icon: Box },
                    { name: t("sidebar.accounting"), href: "/dashboard/shop/accounting", icon: TrendingUp },
                    { name: t("sidebar.salesAnalytics"), href: "/dashboard/shop/analytics", icon: LineChart },
                    { name: t("shop.discovery", "Discovery"), href: "/dashboard/shop/discovery", icon: Lightbulb },
                    { name: t("common.settings"), href: "/dashboard/shop/profile", icon: Settings },
                ];
            case UserRole.MANUFACTURER:
                return [
                    { name: t("sidebar.dashboard"), href: "/dashboard/manufacturer", icon: LayoutDashboard },
                    { name: t("sidebar.purchases"), href: "/dashboard/manufacturer/purchases", icon: ShoppingBag },
                    { name: t("sidebar.production"), href: "/dashboard/manufacturer/production", icon: Factory },
                    { name: t("sidebar.inventory"), href: "/dashboard/manufacturer/inventory", icon: Box },
                    { name: t("sidebar.orders"), href: "/dashboard/manufacturer/orders", icon: ClipboardList },
                    { name: t("sidebar.accounting"), href: "/dashboard/manufacturer/accounting", icon: Wallet },
                    { name: t("sidebar.analytics"), href: "/dashboard/manufacturer/analytics", icon: BarChart2 },
                    { name: t("sidebar.sales"), href: "/dashboard/manufacturer/sales", icon: LineChart },
                    { name: t("sidebar.intelligence", "Intelligence"), href: "/dashboard/manufacturer/intelligence", icon: Brain },
                    { name: t("common.settings"), href: "/dashboard/manufacturer/profile", icon: Settings },
                ];
            case UserRole.CUSTOMER:
                return [
                    { name: t("sidebar.home"), href: "/dashboard/customer", icon: LayoutDashboard },
                    { name: t("sidebar.marketplace"), href: "/dashboard/customer/marketplace", icon: Store },
                    { name: t("sidebar.cart"), href: "/dashboard/customer/cart", icon: ShoppingCart },
                    { name: t("sidebar.orders"), href: "/dashboard/customer/orders", icon: ShoppingBag },
                    { name: t("sidebar.smartBuying", "Smart Buying"), href: "/dashboard/customer/smart-buying", icon: TrendingDown },
                    { name: t("common.settings"), href: "/dashboard/customer/profile", icon: Settings },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className={cn(
            "h-screen bg-green-900 text-white flex flex-col fixed left-0 top-0 transition-all duration-300 z-50",
            isOpen ? "w-64 p-4" : "w-20 p-4 items-center"
        )}>
            <div className="mb-4 flex flex-col items-center justify-center w-full relative">
                {isOpen ? (
                    <h1 className="text-2xl font-bold flex items-center gap-1 w-full justify-between">
                        <div className="flex items-center gap-1">
                            <img src="/logo.png" alt="AgriFlow Logo" className="h-14 w-14 object-contain -ml-2" />
                            AgriFlow
                        </div>
                        {setIsOpen && (
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-green-800 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                    </h1>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <img src="/logo.png" alt="AgriFlow Logo" className="h-10 w-10 object-contain mb-2" />
                        {setIsOpen && (
                            <button 
                                onClick={() => setIsOpen(true)}
                                className="p-1.5 rounded-lg hover:bg-green-800 transition-colors"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
                
                {isOpen && <p className="text-xs text-green-300 mt-1 self-start">{t("auth.supplyChainPlatform")}</p>}
            </div>

            <nav className={cn("flex-1 space-y-1 overflow-y-auto mt-2", isOpen ? "pr-1 w-full" : "w-full flex flex-col items-center overflow-x-hidden")}>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "flex items-center rounded-lg transition-colors hover:bg-green-800 group",
                            isOpen ? "gap-3 px-3 py-2" : "justify-center p-3 mb-2 w-12 h-12",
                            pathname === item.href ? "bg-green-700 text-white" : "text-green-100"
                        )}
                        title={!isOpen ? item.name : undefined}>
                            <item.icon className={cn("flex-shrink-0", isOpen ? "h-5 w-5" : "h-6 w-6 group-hover:scale-110 transition-transform")} />
                            {isOpen && <span>{item.name}</span>}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className={cn("pt-3 border-t border-green-800 mt-2 w-full flex flex-col gap-3", !isOpen && "items-center")}>
                {isOpen && (
                    <div className="px-1 flex items-center gap-2">
                        <div className="flex-1">
                            <LanguageSelector />
                        </div>
                        <div className="shrink-0">
                            <ThemeToggle />
                        </div>
                    </div>
                )}

                {isOpen ? (
                    <div className="px-2 mt-1">
                        <div className="overflow-hidden">
                            <p className="font-semibold truncate">{user?.full_name}</p>
                            <p className="text-xs text-green-300 capitalize truncate">{user?.role === 'manufacturer' ? t("auth.manufacturer") : user?.role === 'farmer' ? t("auth.farmer") : user?.role === 'shop' ? t("auth.shopOwner") : user?.role === 'customer' ? t("auth.customer") : user?.role}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <ThemeToggle />
                    </div>
                )}
                
                <Button
                    variant="ghost"
                    className={cn(
                        "text-red-300 hover:text-red-100 hover:bg-red-900/20",
                        isOpen ? "w-full justify-start" : "w-12 h-12 p-0 justify-center rounded-xl"
                    )}
                    onClick={logout}
                    title={!isOpen ? t("common.logout") : undefined}
                >
                    <LogOut className={isOpen ? "mr-2 h-4 w-4" : "h-5 w-5"} />
                    {isOpen && t("common.logout")}
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
