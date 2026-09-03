"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    Mic,
    Heart,
    History,
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

interface SearchResponse {
    videos: YouTubeVideo[];
    query: string;
    language: string;
}

export default function LearningHubPage() {
    const { t, locale } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<LearningResponse | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [watchHistory, setWatchHistory] = useState<YouTubeVideo[]>([]);
    const [likedVideos, setLikedVideos] = useState<YouTubeVideo[]>([]);

    // Smart search state
    const [searchResults, setSearchResults] = useState<YouTubeVideo[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchedQuery, setSearchedQuery] = useState("");

    // View mode: "feed" | "liked" | "history"
    const [viewMode, setViewMode] = useState<"feed" | "liked" | "history">("feed");

    const fetchVideos = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            const params = new URLSearchParams();
            if (refresh) params.set("refresh", "true");
            // Pass user's preferred language to backend
            if (locale) params.set("lang", locale);
            const queryStr = params.toString();
            const res = await api.get(`/learning/videos${queryStr ? `?${queryStr}` : ""}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to load videos", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Smart search: call backend YouTube search endpoint
    const handleSearch = useCallback(async () => {
        const q = searchQuery.trim();
        if (!q) {
            setSearchResults(null);
            setSearchedQuery("");
            return;
        }
        try {
            setSearching(true);
            setViewMode("feed"); // switch to feed view when searching
            const params = new URLSearchParams({ q });
            if (locale) params.set("lang", locale);
            const res = await api.get<SearchResponse>(`/learning/search?${params.toString()}`);
            setSearchResults(res.data.videos);
            setSearchedQuery(q);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setSearching(false);
        }
    }, [searchQuery, locale]);

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
        setSearchedQuery("");
    };

    useEffect(() => {
        fetchVideos();
        const savedHistory = localStorage.getItem("agri_watch_history");
        if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
        const savedLikes = localStorage.getItem("agri_liked_videos");
        if (savedLikes) setLikedVideos(JSON.parse(savedLikes));
    }, []);

    // Re-fetch when locale changes
    useEffect(() => {
        if (locale) {
            fetchVideos();
        }
    }, [locale]);

    const handleVideoSelect = (video: YouTubeVideo) => {
        setSelectedVideo(video);
        const newHistory = [video, ...watchHistory.filter(v => v.id !== video.id)].slice(0, 50);
        setWatchHistory(newHistory);
        localStorage.setItem("agri_watch_history", JSON.stringify(newHistory));
    };

    const toggleLike = (video: YouTubeVideo) => {
        const isLiked = likedVideos.some(v => v.id === video.id);
        let newLikes;
        if (isLiked) {
            newLikes = likedVideos.filter(v => v.id !== video.id);
        } else {
            newLikes = [video, ...likedVideos];
        }
        setLikedVideos(newLikes);
        localStorage.setItem("agri_liked_videos", JSON.stringify(newLikes));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

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

    // Determine which videos to show
    let displayVideos: YouTubeVideo[] = [];
    let sectionTitle = "";

    if (searchResults !== null) {
        // Search results mode
        displayVideos = searchResults;
        sectionTitle = `Search Results for "${searchedQuery}"`;
    } else if (viewMode === "liked") {
        displayVideos = likedVideos;
        sectionTitle = "Liked Videos";
    } else if (viewMode === "history") {
        displayVideos = watchHistory;
        sectionTitle = "Watch History";
    } else {
        // Normal feed mode with category filtering
        let sourceVideos = data.videos;
        displayVideos = sourceVideos.filter(v => {
            const matchesCategory = activeCategory === "All" || v.category === activeCategory;
            const matchesLocalSearch = !searchQuery ||
                v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesLocalSearch;
        });
    }

    // Pick "For You" — top 4 videos from crop-related categories
    const forYouVideos = data.videos
        .filter(v => ["My Crops", "Fertilizers & Nutrition", "Pest & Disease Control"].includes(v.category))
        .slice(0, 4);

    const showForYou = viewMode === "feed" && activeCategory === "All" && !searchQuery && searchResults === null && forYouVideos.length > 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 dark:border-zinc-800/50 shadow-sm">
                <div className="flex gap-5 items-center">
                    <div className="h-14 w-14 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-all">
                        <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400 tracking-tight">
                            {t("sidebar.learning", "Agri Learning Hub")}
                        </h1>
                        <p className="text-muted-foreground mt-1.5 text-xs font-medium">
                            Curated video guides personalized for your farm — crop tips, fertilizer advice, and expert talks.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => fetchVideos(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                    <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin text-orange-500" : ""}`} />
                    {refreshing ? "Refreshing..." : "Get Fresh Videos"}
                </button>
            </div>



            {/* Video Player */}
            {selectedVideo && (
                <div className="bg-zinc-950/90 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="aspect-video w-full bg-black">
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
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-t from-zinc-950 to-transparent">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white text-xl font-bold line-clamp-1">{selectedVideo.title}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                                        <Video className="h-3 w-3 text-white" />
                                    </div>
                                    {selectedVideo.channel}
                                </span>
                                {selectedVideo.view_count && (
                                    <span className="text-zinc-500 text-xs font-semibold px-2 py-1 bg-zinc-900 rounded-lg flex items-center gap-1.5 border border-zinc-800">
                                        <Eye className="h-3.5 w-3.5" /> {selectedVideo.view_count} views
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleLike(selectedVideo)}
                                className={`h-[42px] w-[42px] flex items-center justify-center rounded-xl transition-all border ${
                                    likedVideos.some(v => v.id === selectedVideo.id)
                                        ? "bg-rose-500/20 border-rose-500/50 text-rose-500"
                                        : "bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                                }`}
                                title="Save/Like Video"
                            >
                                <Heart className={`h-5 w-5 ${likedVideos.some(v => v.id === selectedVideo.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                            </button>
                            <a
                                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg shadow-red-600/20 text-sm font-bold flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" /> Open in YouTube
                            </a>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm font-bold flex items-center gap-2 border border-zinc-700"
                            >
                                <X className="h-4 w-4" /> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar + Liked & History Buttons */}
            <div className="flex max-w-4xl mx-auto w-full items-center gap-3">
                <div className="flex flex-1">
                    <div className="relative flex items-center w-full">
                        <input
                            type="text"
                            placeholder="Search for farming topics, crops, techniques..."
                            className="w-full pl-5 pr-10 py-2 bg-[#121212] border border-[#303030] rounded-l-full text-base text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#1c62b9]"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                // Clear search results when input is emptied
                                if (!e.target.value.trim()) {
                                    setSearchResults(null);
                                    setSearchedQuery("");
                                }
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 p-1.5 rounded-full hover:bg-[#303030] text-gray-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-5 py-2 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030] transition-colors flex items-center justify-center group"
                    >
                        {searching ? (
                            <Loader2 className="h-5 w-5 text-gray-100 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5 text-gray-100 group-hover:text-white" />
                        )}
                    </button>
                </div>
                <button
                    className="h-10 w-10 shrink-0 bg-[#181818] hover:bg-[#303030] rounded-full flex items-center justify-center transition-colors shadow-sm"
                    title="Search with voice"
                >
                    <Mic className="h-5 w-5 text-gray-100" />
                </button>

                {/* Liked Button */}
                <button
                    onClick={() => {
                        clearSearch();
                        setViewMode(viewMode === "liked" ? "feed" : "liked");
                    }}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        viewMode === "liked"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-500/10"
                            : "bg-[#272727] text-gray-100 hover:bg-[#3f3f3f] border border-transparent"
                    }`}
                    title="Liked Videos"
                >
                    <Heart className={`h-4 w-4 ${viewMode === "liked" ? "fill-rose-400" : ""}`} />
                    <span className="hidden sm:inline">Liked</span>
                </button>

                {/* History Button */}
                <button
                    onClick={() => {
                        clearSearch();
                        setViewMode(viewMode === "history" ? "feed" : "history");
                    }}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        viewMode === "history"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                            : "bg-[#272727] text-gray-100 hover:bg-[#3f3f3f] border border-transparent"
                    }`}
                    title="Watch History"
                >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">History</span>
                </button>
            </div>

            {/* Category Tabs (only show when in feed mode and not searching) */}
            {viewMode === "feed" && searchResults === null && (
                <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 pt-4">
                    <button
                        onClick={() => setActiveCategory("All")}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeCategory === "All"
                                ? "bg-gray-100 text-black"
                                : "bg-[#272727] text-gray-100 hover:bg-[#3f3f3f]"
                        }`}
                    >
                        All
                    </button>
                    {data.categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeCategory === cat
                                    ? "bg-gray-100 text-black"
                                    : "bg-[#272727] text-gray-100 hover:bg-[#3f3f3f]"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Section Header for Liked / History / Search Results */}
            {(viewMode !== "feed" || searchResults !== null) && (
                <div className="flex items-center justify-between pt-4">
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                        {searchResults !== null && <Search className="h-6 w-6 text-orange-500" />}
                        {viewMode === "liked" && <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />}
                        {viewMode === "history" && <History className="h-6 w-6 text-blue-500" />}
                        {sectionTitle}
                    </h2>
                    <button
                        onClick={() => {
                            clearSearch();
                            setViewMode("feed");
                        }}
                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <X className="h-4 w-4" /> Back to Feed
                    </button>
                </div>
            )}

            {/* Searching indicator */}
            {searching && (
                <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                    <span className="text-muted-foreground font-medium">Searching YouTube for &quot;{searchQuery}&quot;...</span>
                </div>
            )}

            {/* "For You" Hero Section */}
            {showForYou && (
                <div className="animate-in fade-in duration-700">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 flex items-center gap-3 mb-6">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                        Recommended For You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {forYouVideos.map(video => (
                            <div
                                key={`fy-${video.id}`}
                                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-black/5 dark:border-white/5"
                                onClick={() => handleVideoSelect(video)}
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                            <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                                        </div>
                                    </div>
                                    {video.duration && (
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
                                            {video.duration}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-white text-base font-bold line-clamp-2 drop-shadow-md leading-tight group-hover:text-amber-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-white/80 text-xs font-medium mt-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        {video.channel}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {!searching && displayVideos.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700">
                    <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <Video className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        {searchResults !== null
                            ? `No videos found for "${searchedQuery}". Try different keywords.`
                            : viewMode === "liked"
                            ? "No liked videos yet. Like videos to save them here!"
                            : viewMode === "history"
                            ? "No watch history yet. Start watching to build your history!"
                            : searchQuery
                            ? `No videos found matching "${searchQuery}"`
                            : "No videos found for this category."}
                    </p>
                    {(searchResults !== null || searchQuery) && (
                        <button
                            onClick={clearSearch}
                            className="mt-4 px-6 py-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : !searching && displayVideos.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    {showForYou && (
                        <h2 className="text-2xl font-black text-foreground flex items-center gap-3 mb-6 mt-8">
                            <Leaf className="h-6 w-6 text-emerald-500" />
                            All Videos
                        </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayVideos.map((video) => (
                            <div
                                key={video.id}
                                className="group bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-white/50 dark:border-zinc-800/50 hover:border-rose-300 dark:hover:border-rose-800/50 transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleVideoSelect(video)}
                            >
                                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-zinc-800 m-2 rounded-[1.5rem]">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                            <PlayCircle className="h-10 w-10 text-white fill-white/20" />
                                        </div>
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
                                            {video.duration}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 pt-3">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900/50">
                                            {video.emoji && <span className="text-xs">{video.emoji}</span>}
                                            <Tag className="h-3 w-3" />
                                            {video.category}
                                        </span>
                                        {video.view_count && (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                <Eye className="h-3 w-3" />
                                                {video.view_count}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm mt-auto pt-2.5 border-t border-gray-100 dark:border-zinc-800">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] text-white font-bold">{video.channel.charAt(0)}</span>
                                        </div>
                                        <span className="font-semibold text-xs text-gray-600 dark:text-gray-400 truncate">{video.channel}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* No crops CTA */}
            {data.personalized_for.length === 0 && viewMode === "feed" && searchResults === null && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl rounded-[2rem] p-8 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700" />
                    <div className="relative">
                        <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-2">Get Personalized Recommendations</h3>
                        <p className="text-amber-700/80 dark:text-amber-300/80 font-medium max-w-md mx-auto">
                            Add your crops in the &quot;My Crops&quot; section to receive video recommendations tailored specifically to your farming needs and region.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
