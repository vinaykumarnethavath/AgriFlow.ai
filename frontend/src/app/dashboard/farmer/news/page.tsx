"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, Share2, ExternalLink, Newspaper } from 'lucide-react';
import api, { NewsItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { T } from '@/components/TranslateText';

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news/');
                setNews(res.data);
            } catch (err) {
                console.error("Failed to fetch news", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center space-y-2">
                    <Newspaper className="h-10 w-10 mx-auto text-green-500 animate-pulse" />
                    <p className="text-muted-foreground">{t('news.fetchingNews')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold mb-1">{t('news.title')}</h1>
                <p className="text-muted-foreground text-sm">{t('news.subtitle')}</p>
            </div>

            {news.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>{t('news.noNews')}</p>
                </div>
            ) : (
                news.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={
                                            item.category === 'scheme' ? 'default' :
                                                item.category === 'alert' ? 'destructive' : 'secondary'
                                        } className="uppercase tracking-wider text-[10px]">
                                            {/* Translate category badge */}
                                            {item.category === 'scheme' ? t('news.governmentSchemes') :
                                             item.category === 'alert' ? t('news.weatherAlerts') :
                                             item.category === 'market' ? t('news.marketNews') :
                                             item.category === 'advisory' ? t('news.cropAdvisory') :
                                             item.category === 'technology' ? t('news.technology') :
                                             item.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {item.date}
                                        </span>
                                    </div>

                                    {/* Dynamic title — translated via AI */}
                                    <h3 className="text-xl font-bold text-foreground leading-tight">
                                        <T>{item.title}</T>
                                    </h3>
                                    {/* Dynamic summary — translated via AI */}
                                    <p className="text-muted-foreground leading-relaxed">
                                        <T>{item.summary}</T>
                                    </p>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            {t('news.source')}: {item.source}
                                            {item.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: item.title, text: item.summary, url: item.url || window.location.href }).catch(console.error);
                                        }
                                    }}>
                                        <Share2 className="h-4 w-4 mr-2" /> {t('common.actions')}
                                    </Button>
                                    {item.url && (
                                        <Button size="sm" className="w-full" onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}>
                                            {t('news.readMore')} <ExternalLink className="h-4 w-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
