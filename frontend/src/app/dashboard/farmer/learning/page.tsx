"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Video, PlayCircle, Loader2, BookOpen, Clock, Tag } from "lucide-react";
import api from "@/lib/api";

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    category: string;
    duration: string;
    channel: string;
}

interface LearningResponse {
    categories: string[];
    videos: YouTubeVideo[];
}

export default function LearningHubPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<LearningResponse | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await api.get("/learning/videos");
                setData(res.data);
            } catch (err) {
                console.error("Failed to load videos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
                <p className="mt-4 text-muted-foreground font-medium">Loading educational content...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
                Failed to load Learning Hub.
            </div>
        );
    }

    const filteredVideos = activeCategory === "All" 
        ? data.videos 
        : data.videos.filter(v => v.category === activeCategory);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-rose-500" />
                        {t("sidebar.learning", "Agri Learning Hub")}
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">
                        Curated video guides on Smart Farming, crop techniques, and modern machinery to help you maximize your yield.
                    </p>
                </div>
            </div>

            {/* Video Player Modal/Section (if a video is selected) */}
            {selectedVideo && (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative animate-in fade-in zoom-in-95 duration-300">
                    <div className="aspect-video w-full">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`} 
                            title={selectedVideo.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                    <div className="p-4 bg-slate-900 flex justify-between items-center">
                        <div>
                            <h2 className="text-white text-xl font-bold">{selectedVideo.title}</h2>
                            <p className="text-slate-400 text-sm">{selectedVideo.channel}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedVideo(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            Close Player
                        </button>
                    </div>
                </div>
            )}

            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory("All")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === "All" 
                        ? "bg-rose-500 text-white shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                >
                    All Topics
                </button>
                {data.categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === cat 
                            ? "bg-rose-500 text-white shadow-md" 
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                    <div 
                        key={video.id} 
                        className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                    >
                        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <PlayCircle className="h-14 w-14 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                                {video.duration}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                                    <Tag className="h-3 w-3" />
                                    {video.category}
                                </span>
                            </div>
                            <h3 className="font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {video.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                <span className="font-medium">{video.channel}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVideos.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No videos found for this category.
                </div>
            )}
        </div>
    );
}
