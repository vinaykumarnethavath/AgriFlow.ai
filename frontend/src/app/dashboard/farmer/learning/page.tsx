"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Video,
    PlayCircle,
    Loader2,
    BookOpen,
    Clock,
    Tag,
    RefreshCcw,
    Eye,
    Sparkles,
    Search,
    X,
    ExternalLink,
    Leaf,
} from "lucide-react";
import api from "@/lib/api";

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    category: string;
    emoji: string;
    duration: string;
    channel: string;
    description: string;
    view_count: string;
}

interface LearningResponse {
    categories: string[];
    category_emojis: Record<string, string>;
    videos: YouTubeVideo[];
    personalized_for: string[];
    language: string;
}

export default function LearningHubPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<LearningResponse | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchVideos = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            const res = await api.get(`/learning/videos${refresh ? "?refresh=true" : ""}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to load videos", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                </div>
                <p className="mt-6 text-muted-foreground font-medium">Loading personalized content...</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Finding the best videos for your crops</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                Failed to load Learning Hub. Please try again later.
            </div>
        );
    }

    const filteredVideos = data.videos.filter(v => {
        const matchesCategory = activeCategory === "All" || v.category === activeCategory;
        const matchesSearch = !searchQuery ||
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Pick "For You" — top 4 videos from crop-related categories
    const forYouVideos = data.videos
        .filter(v => ["My Crops", "Fertilizers & Nutrition", "Pest & Disease Control"].includes(v.category))
        .slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        {t("sidebar.learning", "Agri Learning Hub")}
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">
                        Curated video guides personalized for your farm — crop tips, fertilizer advice, market insights, and expert talks.
                    </p>
                </div>
                <button
                    onClick={() => fetchVideos(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                    <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Get Fresh Videos"}
                </button>
            </div>

            {/* Personalization Banner */}
            {data.personalized_for.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl px-5 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Personalized for your crops:{" "}
                            {data.personalized_for.map((crop, i) => (
                                <span key={crop}>
                                    <span className="font-bold">{crop}</span>
                                    {i < data.personalized_for.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            Videos are selected in your regional language based on your location
                        </p>
                    </div>
                </div>
            )}

            {/* Video Player (if a video is selected) */}
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
                    <div className="p-4 bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white text-lg font-bold line-clamp-1">{selectedVideo.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-slate-400 text-sm">{selectedVideo.channel}</span>
                                {selectedVideo.view_count && (
                                    <span className="text-slate-500 text-xs flex items-center gap-1">
                                        <Eye className="h-3 w-3" /> {selectedVideo.view_count} views
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> YouTube
                            </a>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" /> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search videos by title, channel..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory("All")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === "All"
                            ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20"
                            : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                    }`}
                >
                    All Topics
                </button>
                {data.categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                            activeCategory === cat
                                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20"
                                : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                        }`}
                    >
                        {data.category_emojis[cat] && <span>{data.category_emojis[cat]}</span>}
                        {cat}
                    </button>
                ))}
            </div>

            {/* "For You" Hero Section (only on "All" tab and if we have crop-specific videos) */}
            {activeCategory === "All" && forYouVideos.length > 0 && !searchQuery && (
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Recommended For You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {forYouVideos.map(video => (
                            <div
                                key={`fy-${video.id}`}
                                className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="text-white text-sm font-bold line-clamp-2 drop-shadow-lg leading-tight">
                                        {video.title}
                                    </h3>
                                    <p className="text-white/70 text-xs mt-1">{video.channel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {filteredVideos.length === 0 ? (
                <div className="text-center py-16">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                        {searchQuery
                            ? `No videos found matching "${searchQuery}"`
                            : "No videos found for this category."}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 text-sm text-rose-600 hover:text-rose-700 font-medium"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    {activeCategory === "All" && forYouVideos.length > 0 && !searchQuery && (
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4 mt-2">
                            <Leaf className="h-5 w-5 text-green-500" />
                            All Videos
                        </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:border-rose-200 dark:hover:border-rose-800 transition-all cursor-pointer"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <PlayCircle className="h-14 w-14 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                                            {video.emoji && <span>{video.emoji}</span>}
                                            <Tag className="h-2.5 w-2.5" />
                                            {video.category}
                                        </span>
                                        {video.view_count && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                <Eye className="h-2.5 w-2.5" />
                                                {video.view_count}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                            {video.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="font-medium truncate">{video.channel}</span>
                                        {video.duration && (
                                            <span className="flex items-center gap-1 text-xs flex-shrink-0">
                                                <Clock className="h-3 w-3" />
                                                {video.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No crops CTA */}
            {data.personalized_for.length === 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-center">
                    <Leaf className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <h3 className="font-bold text-amber-800 dark:text-amber-200">Get Personalized Recommendations</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        Add your crops in the "My Crops" section to receive video recommendations tailored to your farming needs.
                    </p>
                </div>
            )}
        </div>
    );
}
