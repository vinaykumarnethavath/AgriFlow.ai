"use client";

import React from 'react';
import WeatherBoard from '@/components/info/WeatherBoard';
import { useLanguage } from '@/context/LanguageContext';

export default function WeatherPage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('weather.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('weather.subtitle')}</p>
            </div>
            <WeatherBoard />
        </div>
    );
}
