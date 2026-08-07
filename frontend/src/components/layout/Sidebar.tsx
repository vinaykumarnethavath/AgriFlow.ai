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
    Brain
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import { LanguageSelector } from "../LanguageSelector";

const Sidebar = () => {
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
        <div className="h-screen w-64 bg-green-900 text-white flex flex-col p-4 fixed left-0 top-0">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <img src="/logo.png" alt="AgriFlow Logo" className="h-8 w-8 object-contain" />
                    AgriFlow
                </h1>
                <p className="text-xs text-green-300 mt-1">{t("auth.supplyChainPlatform")}</p>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-green-800",
                            pathname === item.href ? "bg-green-700 text-white" : "text-green-100"
                        )}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="pt-4 border-t border-green-800">
                {/* Language Selector */}
                <div className="mb-3 px-1">
                    <LanguageSelector />
                </div>

                <div className="mb-4 px-2 flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{user?.full_name}</p>
                        <p className="text-xs text-green-300 capitalize">{user?.role === 'manufacturer' ? t("auth.manufacturer") : user?.role === 'farmer' ? t("auth.farmer") : user?.role === 'shop' ? t("auth.shopOwner") : user?.role === 'customer' ? t("auth.customer") : user?.role}</p>
                    </div>
                    <ThemeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-300 hover:text-red-100 hover:bg-red-900/20"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("common.logout")}
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
