"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import {
    MessageSquare,
    Send,
    Search,
    Image as ImageIcon,
    MapPin,
    User,
    Users,
    ArrowLeft,
    Loader2,
    Paperclip,
    TrendingUp,
    Sprout,
    X,
    MessageCircle,
    Calendar,
    Share2,
    HelpCircle,
    Mic,
    Square,
    FileText,
    CheckCircle2
} from "lucide-react";

// Interfaces matching backend models and routers
interface ChannelRead {
    id: number;
    name: string;
    channel_type: "p2p" | "group";
    location_tag: string | null;
    created_at: string;
    last_message: string | null;
    last_message_time: string | null;
}

interface MessageRead {
    id: number;
    channel_id: number;
    sender_id: number;
    sender_name: string;
    message_text: string;
    media_url: string | null;
    media_type: string | null;
    sender_role: string | null;
    created_at: string;
}

interface FarmerListItem {
    id: number;
    full_name: string;
    role: string;
    district: string | null;
    state: string | null;
    profile_picture_url: string | null;
}

export default function CommunityPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [channels, setChannels] = useState<ChannelRead[]>([]);
    const [activeChannel, setActiveChannel] = useState<ChannelRead | null>(null);
    const [messages, setMessages] = useState<MessageRead[]>([]);
    const [discoveredFarmers, setDiscoveredFarmers] = useState<FarmerListItem[]>([]);

    // Loading states
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingDiscover, setLoadingDiscover] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form/Search inputs
    const [activeTab, setActiveTab] = useState<"chats" | "discover">("chats");
    const [discoverQuery, setDiscoverQuery] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Responsive mobile views
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Mounted check to prevent hydration mismatch for locale dates
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchChannels();
    }, []);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll when messages update
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    // Fetch active channels
    const fetchChannels = async (selectChannelId?: number) => {
        try {
            setLoadingChannels(true);
            const res = await api.get("/chat/channels");
            setChannels(res.data);
            
            // If a channel ID is requested to be active, set it
            if (selectChannelId) {
                const found = res.data.find((c: ChannelRead) => c.id === selectChannelId);
                if (found) {
                    setActiveChannel(found);
                    fetchMessages(found.id);
                }
            } else if (res.data.length > 0 && !activeChannel) {
                // Optionally select the first channel by default
                setActiveChannel(res.data[0]);
                fetchMessages(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch channels", err);
        } finally {
            setLoadingChannels(false);
        }
    };

    // Fetch messages for a specific channel
    const fetchMessages = async (channelId: number) => {
        try {
            setLoadingMessages(true);
            const res = await api.get(`/chat/channels/${channelId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Discover local farmers
    const handleDiscoverSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            setLoadingDiscover(true);
            const res = await api.get("/chat/discover", {
                params: { query: discoverQuery }
            });
            setDiscoveredFarmers(res.data);
        } catch (err) {
            console.error("Failed to discover farmers", err);
        } finally {
            setLoadingDiscover(false);
        }
    };

    // Auto-trigger discover search on empty query/mount to show some farmers
    useEffect(() => {
        if (activeTab === "discover") {
            handleDiscoverSearch();
        }
    }, [activeTab]);

    // Start a P2P chat with a farmer
    const startP2PChat = async (farmerId: number) => {
        try {
            const res = await api.post(`/chat/channels/p2p/${farmerId}`);
            const channel = res.data;
            // Switch tabs, refresh channels list and select the newly created/retrieved P2P channel
            setActiveTab("chats");
            setMobileShowChat(true);
            await fetchChannels(channel.id);
        } catch (err) {
            console.error("Failed to start direct message chat", err);
        }
    };

    // Send chat message
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeChannel || (!newMessage.trim() && !mediaUrl)) return;

        try {
            const payload = {
                message_text: newMessage.trim(),
                media_url: mediaUrl,
                media_type: mediaType
            };
            const res = await api.post(`/chat/channels/${activeChannel.id}/messages`, payload);
            
            // Append message and clear inputs
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
            setMediaUrl(null);
            setMediaType(null);
            
            // Update last message status in channels list locally
            setChannels((prevChannels) =>
                prevChannels.map((ch) =>
                    ch.id === activeChannel.id
                        ? {
                              ...ch,
                              last_message: payload.message_text || "Image Sent",
                              last_message_time: new Date().toISOString()
                          }
                        : ch
                )
            );
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    // Handle media uploading
    const handleMediaUpload = async (fileOrBlob: File | Blob, typeHint?: string) => {
        const formData = new FormData();
        
        let determinedType = "image";
        if (typeHint) {
            determinedType = typeHint;
        } else if (fileOrBlob instanceof File) {
            if (fileOrBlob.type.startsWith("video/")) determinedType = "video";
            else if (fileOrBlob.type.startsWith("audio/")) determinedType = "audio";
            else if (fileOrBlob.type === "application/pdf") determinedType = "pdf";
        }

        // if blob from recorder, append as file
        if (fileOrBlob instanceof File) {
            formData.append("file", fileOrBlob);
        } else {
            formData.append("file", fileOrBlob, "voice_note.webm");
        }

        try {
            setUploading(true);
            const res = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setMediaUrl(res.data.url);
            setMediaType(determinedType);
        } catch (err) {
            console.error("Media upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleMediaUpload(file);
        }
    };
    
    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                handleMediaUpload(audioBlob, "audio");
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to access microphone", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Quick suggestions helper
    const handleQuickReply = (text: string) => {
        setNewMessage((prev) => (prev ? `${prev} ${text}` : text));
    };

    // Select channel and load messages
    const selectChannel = (channel: ChannelRead) => {
        setActiveChannel(channel);
        fetchMessages(channel.id);
        setMobileShowChat(true);
    };

    // Date formatting helper
    const formatTime = (isoString: string) => {
        if (!mounted) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    const formatDateHeader = (isoString: string) => {
        if (!mounted) return "";
        try {
            const date = new Date(isoString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return t("common.today", "Today");
            } else if (date.toDateString() === yesterday.toDateString()) {
                return t("common.yesterday", "Yesterday");
            } else {
                return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
            }
        } catch {
            return "";
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-green-900 dark:bg-green-950 text-white py-4 px-6 flex items-center justify-between border-b border-green-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-800 rounded-lg">
                        <Users className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">
                            {t("community.hub", "Farmer Community Hub")}
                        </h1>
                        <p className="text-xs text-green-300">
                            {t("community.hubSubtitle", "Connect with farmers, share expertise, and trade farming tips locally.")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Side: Active Chats / Discover Farmers */}
                <div
                    className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col transition-all duration-300 ${
                        mobileShowChat ? "hidden md:flex" : "flex"
                    }`}
                >
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 bg-slate-50 dark:bg-slate-900">
                        <Button
                            variant={activeTab === "chats" ? "default" : "ghost"}
                            className={`flex-1 text-xs gap-2 py-1.5 h-auto rounded-lg ${
                                activeTab === "chats" ? "bg-green-700 hover:bg-green-800 text-white" : "text-slate-600 dark:text-slate-400"
                            }`}
                            id="btn-tab-chats"
                            onClick={() => setActiveTab("chats")}
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t("community.chats", "Active Chats")}
                        </Button>
                        <Button
                            variant={activeTab === "discover" ? "default" : "ghost"}
                            className={`flex-1 text-xs gap-2 py-1.5 h-auto rounded-lg ${
                                activeTab === "discover" ? "bg-green-700 hover:bg-green-800 text-white" : "text-slate-600 dark:text-slate-400"
                            }`}
                            id="btn-tab-discover"
                            onClick={() => setActiveTab("discover")}
                        >
                            <Search className="h-4 w-4" />
                            {t("community.discover", "Discover")}
                        </Button>
                    </div>

                    {/* Active Chats list tab */}
                    {activeTab === "chats" && (
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
                            {loadingChannels ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-green-600" />
                                    <p className="text-xs">{t("common.loading", "Loading active channels...")}</p>
                                </div>
                            ) : channels.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30 text-green-700" />
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">
                                        {t("community.noChatsTitle", "No Active Chats")}
                                    </p>
                                    <p className="text-xs leading-relaxed">
                                        {t("community.noChatsDesc", "Connect with other farmers via the Discover tab or join automatically via your profile location.")}
                                    </p>
                                </div>
                            ) : (
                                channels.map((ch) => {
                                    const isSelected = activeChannel?.id === ch.id;
                                    const initials = ch.name.substring(0, 2).toUpperCase();
                                    return (
                                        <div
                                            key={ch.id}
                                            id={`channel-${ch.id}`}
                                            onClick={() => selectChannel(ch)}
                                            className={`p-3.5 flex gap-3 cursor-pointer items-start hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                                                isSelected ? "bg-green-50/70 dark:bg-green-950/20 border-l-4 border-green-600" : ""
                                            }`}
                                        >
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                                                ch.channel_type === "group" 
                                                ? "bg-emerald-600 text-white" 
                                                : "bg-blue-600 text-white"
                                            }`}>
                                                {ch.channel_type === "group" ? <Users className="h-5 w-5" /> : initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                                        {ch.name}
                                                    </h3>
                                                    {ch.last_message_time && (
                                                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                                            {formatTime(ch.last_message_time)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {ch.last_message || t("community.noMessages", "No messages yet")}
                                                </p>
                                                {ch.location_tag && (
                                                    <span className="inline-flex mt-1 items-center gap-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                                                        <MapPin className="h-2 w-2 text-slate-400" />
                                                        {ch.location_tag}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Discover farmers tab */}
                    {activeTab === "discover" && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <form onSubmit={handleDiscoverSearch} className="p-3 flex gap-2 border-b border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50">
                                <Input
                                    type="text"
                                    placeholder={t("community.searchPlaceholder", "Search by name...")}
                                    value={discoverQuery}
                                    onChange={(e) => setDiscoverQuery(e.target.value)}
                                    id="input-discover-search"
                                    className="bg-white dark:bg-slate-950 h-8 text-xs"
                                />
                                <Button type="submit" size="sm" className="bg-green-700 hover:bg-green-800 text-white h-8 px-2.5" id="btn-discover-search">
                                    <Search className="h-3.5 w-3.5" />
                                </Button>
                            </form>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {loadingDiscover ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-green-600" />
                                        <p className="text-xs">{t("community.searching", "Searching farmers...")}</p>
                                    </div>
                                ) : discoveredFarmers.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-xs">
                                        <User className="h-8 w-8 mx-auto mb-2 opacity-30 text-green-700" />
                                        <p>{t("community.noFarmersFound", "No farmers found matching query.")}</p>
                                    </div>
                                ) : (
                                    discoveredFarmers.map((farmer) => (
                                        <Card key={farmer.id} className="overflow-hidden border-slate-100 dark:border-slate-900 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-3 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {farmer.full_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate flex items-center gap-1">
                                                            {farmer.full_name}
                                                            {farmer.role === 'expert' && <span title="Verified Expert"><CheckCircle2 className="h-3 w-3 text-blue-500" /></span>}
                                                        </h4>
                                                        {(farmer.district || farmer.state) && (
                                                            <p className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
                                                                <MapPin className="h-2 w-2 text-slate-400" />
                                                                {farmer.district && `${farmer.district}, `}{farmer.state}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    id={`btn-chat-farmer-${farmer.id}`}
                                                    onClick={() => startP2PChat(farmer.id)}
                                                    className="bg-green-700 hover:bg-green-800 text-white text-[11px] h-7 px-3 shrink-0 rounded-lg"
                                                >
                                                    {t("community.chatBtn", "Chat")}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Chat Window */}
                <div
                    className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 transition-all duration-300 ${
                        mobileShowChat ? "flex" : "hidden md:flex"
                    }`}
                >
                    {activeChannel ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white dark:bg-slate-950 py-3.5 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                                <div className="flex items-center gap-3">
                                    {/* Back Button on mobile */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        id="btn-chat-back"
                                        className="md:hidden p-1 mr-1 text-slate-600 dark:text-slate-300"
                                        onClick={() => setMobileShowChat(false)}
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>

                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                                        activeChannel.channel_type === "group" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                                    }`}>
                                        {activeChannel.channel_type === "group" ? (
                                            <Users className="h-5 w-5" />
                                        ) : (
                                            activeChannel.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                                            {activeChannel.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 rounded">
                                                {activeChannel.channel_type === "group" 
                                                    ? t("community.groupChat", "Group Chat") 
                                                    : t("community.p2pChat", "Private Message")}
                                            </Badge>
                                            {activeChannel.location_tag && (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                                    <MapPin className="h-2.5 w-2.5 text-slate-400" />
                                                    {activeChannel.location_tag}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-48 text-slate-400">
                                        <Loader2 className="h-8 w-8 animate-spin text-green-600 mr-2" />
                                        <span className="text-xs">{t("community.loadingMessages", "Loading messages...")}</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                                        <MessageSquare className="h-10 w-10 mb-2 opacity-35 text-green-700 animate-bounce" />
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                            {t("community.noMessagesYet", "No messages here yet")}
                                        </p>
                                        <p className="text-xs mt-1 max-w-xs">
                                            {t("community.sayHello", "Start the conversation by typing a message below or upload a photo of your crops.")}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isCurrentUser = msg.sender_id === user?.id;
                                        
                                        // Determine if date header needs to be displayed
                                        const prevMsg = index > 0 ? messages[index - 1] : null;
                                        const showDateHeader =
                                            !prevMsg ||
                                            new Date(prevMsg.created_at).toDateString() !==
                                                new Date(msg.created_at).toDateString();

                                        return (
                                            <div key={msg.id} className="space-y-2">
                                                {showDateHeader && (
                                                    <div className="flex justify-center my-4">
                                                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                            {formatDateHeader(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                                                    {/* Sender Name (for group chats) */}
                                                    {!isCurrentUser && activeChannel.channel_type === "group" && (
                                                        <span className="text-[10px] font-medium text-slate-500 ml-2 mb-0.5 flex items-center gap-1">
                                                            {msg.sender_name}
                                                            {msg.sender_role === 'expert' && (
                                                                <span className="inline-flex items-center text-blue-600 dark:text-blue-400" title="Verified Expert">
                                                                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                                                                    Expert
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                    
                                                    {/* Message Bubble Container */}
                                                    <div
                                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                                                            isCurrentUser
                                                                ? "bg-gradient-to-r from-green-700 to-green-600 text-white rounded-tr-none"
                                                                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-800/80 rounded-tl-none"
                                                        }`}
                                                    >
                                                        {/* Media rendering */}
                                                        {msg.media_url && (
                                                            <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-black/20">
                                                                {msg.media_type === 'video' ? (
                                                                    <video src={msg.media_url} controls className="max-w-full max-h-60 rounded-md" />
                                                                ) : msg.media_type === 'audio' ? (
                                                                    <div className="p-2">
                                                                        <audio src={msg.media_url} controls className="w-48 sm:w-64 max-w-full" />
                                                                    </div>
                                                                ) : msg.media_type === 'pdf' ? (
                                                                    <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                                        <FileText className="h-8 w-8 text-rose-500" />
                                                                        <span className="text-sm font-medium underline text-blue-600 dark:text-blue-400">View PDF Document</span>
                                                                    </a>
                                                                ) : (
                                                                    <img
                                                                        src={msg.media_url}
                                                                        alt="Uploaded attachment"
                                                                        className="max-h-60 w-auto object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                                        onClick={() => window.open(msg.media_url!, "_blank")}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.message_text && (
                                                            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                                                {msg.message_text}
                                                            </p>
                                                        )}
                                                        
                                                        {/* Timestamp inside bubble */}
                                                        <div className={`text-[9px] mt-1 text-right leading-none ${
                                                            isCurrentUser ? "text-green-100" : "text-slate-400"
                                                        }`}>
                                                            {formatTime(msg.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Composer */}
                            <div className="bg-white dark:bg-slate-950 p-3 border-t border-slate-200 dark:border-slate-800 shadow-lg shrink-0">
                                {/* Quick agriculture shortcut suggestions */}
                                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-100 dark:border-slate-900 no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickReply(t("community.shortcutPest", "Here is a pest control tip that worked for me: "))}
                                        className="text-[10px] bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 hover:dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 whitespace-nowrap"
                                    >
                                        🌾 {t("community.pestTip", "Pest Tip")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickReply(t("community.shortcutCropPlan", "Here is my crop plan for this season: "))}
                                        className="text-[10px] bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 hover:dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 whitespace-nowrap"
                                    >
                                        🚜 {t("community.cropPlanTip", "Crop Plan")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickReply(t("community.shortcutMarket", "What are the latest market prices for crops in your mandi?"))}
                                        className="text-[10px] bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 hover:dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 whitespace-nowrap"
                                    >
                                        📈 {t("community.marketPricesTip", "Mandi Prices")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickReply(t("community.shortcutWeather", "How is the weather conditions at your farm today?"))}
                                        className="text-[10px] bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 hover:dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 whitespace-nowrap"
                                    >
                                        🌦️ {t("community.weatherTip", "Weather Status")}
                                    </button>
                                </div>

                                {/* Media Preview */}
                                {mediaUrl && (
                                    <div className="relative inline-block mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                        {mediaType === 'audio' ? (
                                            <audio src={mediaUrl} controls className="h-10 w-48" />
                                        ) : mediaType === 'video' ? (
                                            <video src={mediaUrl} className="h-16 w-16 object-cover rounded-md" />
                                        ) : mediaType === 'pdf' ? (
                                            <div className="flex items-center gap-2 p-1"><FileText className="h-8 w-8 text-rose-500" /><span className="text-xs">PDF attached</span></div>
                                        ) : (
                                            <img src={mediaUrl} alt="Upload preview" className="h-16 w-16 object-cover rounded-md" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setMediaUrl(null); setMediaType(null); }}
                                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform shadow-md hover:scale-110"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Main Form */}
                                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                    {/* Upload Input */}
                                    <input
                                        type="file"
                                        accept="image/*,video/*,audio/*,.pdf"
                                        ref={fileInputRef}
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                    
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        id="btn-chat-upload"
                                        disabled={uploading || isRecording}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-slate-200 dark:border-slate-800 text-slate-500 hover:text-green-700 dark:hover:text-green-500 h-10 w-10 shrink-0 rounded-xl"
                                    >
                                        {uploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                        ) : (
                                            <Paperclip className="h-4.5 w-4.5" />
                                        )}
                                    </Button>

                                    {/* Voice Recorder */}
                                    <Button
                                        type="button"
                                        variant={isRecording ? "destructive" : "outline"}
                                        size="icon"
                                        id="btn-chat-record"
                                        disabled={uploading}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`shrink-0 h-10 w-10 rounded-xl ${isRecording ? 'animate-pulse bg-rose-100 text-rose-600 border-rose-200' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-500'}`}
                                    >
                                        {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4.5 w-4.5" />}
                                    </Button>
                                    {isRecording && (
                                        <div className="text-xs text-rose-500 font-medium w-12 text-center animate-pulse">
                                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                        </div>
                                    )}

                                    {/* Message Input */}
                                    <Input
                                        type="text"
                                        placeholder={t("community.inputPlaceholder", "Type a message here...")}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        id="input-chat-message"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10 text-xs rounded-xl focus-visible:ring-green-600"
                                    />

                                    {/* Send button */}
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() && !mediaUrl}
                                        id="btn-chat-send"
                                        className="bg-green-700 hover:bg-green-800 text-white px-4 h-10 shrink-0 rounded-xl flex items-center gap-1.5"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Welcome / Selection Placeholder */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl mb-4 border border-green-100 dark:border-green-900/30">
                                <MessageSquare className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-1.5">
                                {t("community.noChatActive", "Join the Conversation")}
                            </h3>
                            <p className="text-xs leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
                                {t(
                                    "community.welcomeMessage",
                                    "Select an active group or direct message chat from the sidebar, or discover other local farmers to start a direct message."
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
