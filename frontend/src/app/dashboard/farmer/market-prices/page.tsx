"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCcw, ChevronLeft, ChevronRight, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import api, { MarketPrice } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { T } from '@/components/TranslateText';

export default function MarketPricesPage() {
    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price_high' | 'price_low'>('name');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const { t } = useLanguage();

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/market/prices');
            setPrices(res.data);
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
            console.error("Failed to fetch market prices", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const scrollMarkets = (cropName: string, direction: 'left' | 'right') => {
        const ref = scrollRefs.current[cropName];
        if (ref) {
            ref.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    const filteredPrices = prices
        .filter(p => p.crop_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'price_high') return b.market_price - a.market_price;
            if (sortBy === 'price_low') return a.market_price - b.market_price;
            return a.crop_name.localeCompare(b.crop_name);
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('marketPrices.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('marketPrices.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
                            {t('marketPrices.lastUpdated')}: {lastUpdated}
                        </span>
                    )}
                    <Button onClick={fetchPrices} variant="outline" size="sm" className="gap-2">
                        <RefreshCcw className="h-4 w-4" /> {t('common.refresh')}
                    </Button>
                </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('marketPrices.searchCommodity')}
                        className="w-full pl-10 pr-4 py-2.5 border dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="border dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900 cursor-pointer focus:ring-2 focus:ring-green-500 outline-none"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                    >
                        <option value="name">{t('marketPrices.commodity')} A–Z</option>
                        <option value="price_high">{t('market.priceHighLow')}</option>
                        <option value="price_low">{t('market.priceLowHigh')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-xl" />
                    ))}
                </div>
            ) : filteredPrices.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No crops found matching &quot;{searchQuery}&quot;</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {filteredPrices.map((crop, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow overflow-hidden border border-border/80 flex flex-col justify-between">
                            <CardHeader className="flex flex-row items-center justify-between py-2 px-3.5 bg-gray-50/80 dark:bg-zinc-800/80 border-b">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CardTitle className="text-sm font-bold text-foreground truncate">{crop.crop_name}</CardTitle>
                                    {crop.msp_comparison === 'above' && (
                                        <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 whitespace-nowrap">
                                            {t('marketPrices.priceUp')}
                                        </span>
                                    )}
                                    {crop.msp_comparison === 'below' && (
                                        <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full border border-red-200 whitespace-nowrap">
                                            {t('marketPrices.priceDown')}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${crop.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                    {crop.trend === 'up' ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                    ₹{Math.abs(crop.change)}
                                </span>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                                {/* Primary Price */}
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-extrabold text-foreground">₹{crop.market_price.toLocaleString()}</span>
                                            <span className="text-[11px] text-muted-foreground font-normal">{t('marketPrices.perQuintal')}</span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('marketPrices.maxPrice')}</span>
                                    </div>
                                    {crop.msp > 0 && (
                                        <div className="text-right">
                                            <span className="text-[10px] text-muted-foreground block leading-tight">{t('marketPrices.mandi')} (MSP)</span>
                                            <span className="text-xs font-bold text-muted-foreground">₹{crop.msp.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Scrollable Nearby Markets */}
                                {crop.markets && crop.markets.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('marketPrices.mandi')}</p>
                                        <div className="relative">
                                            <button
                                                onClick={() => scrollMarkets(crop.crop_name, 'left')}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-zinc-800/95 shadow-xs rounded-full p-0.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 -ml-1.5"
                                            >
                                                <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                            <div
                                                ref={el => { scrollRefs.current[crop.crop_name] = el; }}
                                                className="flex gap-2 overflow-x-auto px-2 py-0.5"
                                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                                {crop.markets.map((market: any, mIdx: number) => (
                                                    <div
                                                        key={mIdx}
                                                        className="flex-shrink-0 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 min-w-[125px] hover:border-green-300 dark:hover:border-green-700 hover:shadow-2xs transition-all cursor-pointer"
                                                    >
                                                        <p className="text-[11px] font-semibold text-foreground truncate">{market.market_name}</p>
                                                        <p className="text-sm font-black text-foreground mt-0.5">₹{market.price.toLocaleString()}</p>
                                                        <div className="flex items-center justify-between mt-1 text-[9px]">
                                                            <span className="text-muted-foreground bg-gray-100 dark:bg-zinc-700 px-1 py-0.2 rounded">{market.distance_km} km</span>
                                                            <span className={`font-bold flex items-center gap-0.5 ${market.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                                                {market.trend === 'up' ? '↑' : '↓'}₹{Math.abs(market.change)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => scrollMarkets(crop.crop_name, 'right')}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-zinc-800/95 shadow-xs rounded-full p-0.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 -mr-1.5"
                                            >
                                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Decision Hint */}
                                <div className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/50 rounded-md px-2 py-1">
                                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-tight">
                                        💡 <T>{crop.trend === 'up' ? 'Prices increasing. Consider waiting for better rates.' : 'Prices declining. Check MSP before selling.'}</T>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
