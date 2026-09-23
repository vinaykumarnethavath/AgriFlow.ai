"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    ChevronLeft, ChevronRight, Plus, Trash2, Check,
    Calendar, Sprout, Droplets, Bug, Scissors, Wallet,
    CloudRain, SprayCan, FileText, X
} from "lucide-react";
import {
    FarmEvent, FarmEventCreate,
    getFarmEvents, createFarmEvent, deleteFarmEvent, toggleFarmEvent
} from "@/lib/api";

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    sowing: { label: "Sowing", icon: <Sprout className="h-3.5 w-3.5" />, color: "text-green-700", bg: "bg-green-100 dark:bg-green-900/40", border: "border-green-300" },
    fertilizer: { label: "Fertilizer", icon: <Droplets className="h-3.5 w-3.5" />, color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300" },
    weeding: { label: "Weeding", icon: <Scissors className="h-3.5 w-3.5" />, color: "text-purple-700", bg: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300" },
    harvest: { label: "Harvest", icon: <Calendar className="h-3.5 w-3.5" />, color: "text-yellow-700", bg: "bg-yellow-100 dark:bg-yellow-900/40", border: "border-yellow-300" },
    loan: { label: "Loan/Payment", icon: <Wallet className="h-3.5 w-3.5" />, color: "text-red-700", bg: "bg-red-100 dark:bg-red-900/40", border: "border-red-300" },
    irrigation: { label: "Irrigation", icon: <CloudRain className="h-3.5 w-3.5" />, color: "text-cyan-700", bg: "bg-cyan-100 dark:bg-cyan-900/40", border: "border-cyan-300" },
    spraying: { label: "Spraying", icon: <SprayCan className="h-3.5 w-3.5" />, color: "text-orange-700", bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300" },
    custom: { label: "Custom", icon: <FileText className="h-3.5 w-3.5" />, color: "text-gray-700", bg: "bg-gray-100 dark:bg-gray-800/40", border: "border-gray-300" },
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function FarmCalendarPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [events, setEvents] = useState<FarmEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<FarmEventCreate>({
        title: "",
        event_type: "custom",
        event_date: today.toISOString().split("T")[0],
        description: "",
        reminder_days_before: 1,
    });

    // Fetch events for current month
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await getFarmEvents(currentMonth, currentYear);
            setEvents(data);
        } catch (e) {
            console.error("Failed to fetch calendar events", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentMonth, currentYear]);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const startDayOfWeek = firstDay.getDay(); // 0=Sun
        const daysInMonth = lastDay.getDate();

        const days: { date: number; dateStr: string; isToday: boolean; events: FarmEvent[] }[] = [];

        // Pad start with empty slots
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: 0, dateStr: "", isToday: false, events: [] });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = d === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();

            const dayEvents = events.filter(e => {
                const evDate = e.event_date.split("T")[0];
                return evDate === dateStr;
            });

            days.push({ date: d, dateStr, isToday, events: dayEvents });
        }

        return days;
    }, [currentMonth, currentYear, events]);

    // Selected date events
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(e => e.event_date.split("T")[0] === selectedDate);
    }, [selectedDate, events]);

    // Navigation
    const goToPrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth() + 1);
        setCurrentYear(today.getFullYear());
    };

    // Event handlers
    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title.trim()) return;
        try {
            await createFarmEvent(newEvent);
            setIsAddModalOpen(false);
            setNewEvent({
                title: "",
                event_type: "custom",
                event_date: selectedDate || today.toISOString().split("T")[0],
                description: "",
                reminder_days_before: 1,
            });
            fetchEvents();
        } catch (error) {
            console.error("Failed to create event", error);
            alert("Failed to create event");
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (eventId === 0) return; // Auto-generated events can't be deleted
        try {
            await deleteFarmEvent(eventId);
            fetchEvents();
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const handleToggleEvent = async (eventId: number) => {
        if (eventId === 0) return; // Auto-generated events can't be toggled
        try {
            await toggleFarmEvent(eventId);
            fetchEvents();
        } catch (error) {
            console.error("Failed to toggle event", error);
        }
    };

    const openAddModal = (dateStr?: string) => {
        setNewEvent(prev => ({
            ...prev,
            event_date: dateStr || selectedDate || today.toISOString().split("T")[0],
        }));
        setIsAddModalOpen(true);
    };

    // Stats
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.is_completed).length;
    const upcomingEvents = events.filter(e => !e.is_completed && new Date(e.event_date) >= today).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Calendar className="h-7 w-7 text-green-600" />
                        Farm Calendar
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Plan and track all your farming activities</p>
                </div>
                <Button
                    onClick={() => openAddModal()}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{totalEvents}</p>
                        <p className="text-xs text-muted-foreground font-medium">Total Events</p>
                    </CardContent>
                </Card>
                <Card className="border border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-green-700 dark:text-green-400">{completedEvents}</p>
                        <p className="text-xs text-muted-foreground font-medium">Completed</p>
                    </CardContent>
                </Card>
                <Card className="border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{upcomingEvents}</p>
                        <p className="text-xs text-muted-foreground font-medium">Upcoming</p>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar */}
            <Card className="border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <button onClick={goToPrevMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{MONTH_NAMES[currentMonth - 1]} {currentYear}</h2>
                            <button onClick={goToToday} className="text-xs text-green-100 hover:text-white underline mt-0.5">
                                Go to Today
                            </button>
                        </div>
                        <button onClick={goToNextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                        {DAY_NAMES.map(day => (
                            <div key={day} className="p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading calendar...</div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`min-h-[90px] border-r border-b p-1.5 cursor-pointer transition-colors ${
                                        day.date === 0 ? "bg-muted/20" :
                                        day.isToday ? "bg-green-50/80 dark:bg-green-950/30" :
                                        selectedDate === day.dateStr ? "bg-blue-50/80 dark:bg-blue-950/30" :
                                        "hover:bg-muted/30"
                                    }`}
                                    onClick={() => day.date > 0 && setSelectedDate(day.dateStr)}
                                    onDoubleClick={() => day.date > 0 && openAddModal(day.dateStr)}
                                >
                                    {day.date > 0 && (
                                        <>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-bold ${
                                                    day.isToday
                                                        ? "bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
                                                        : "text-foreground"
                                                }`}>
                                                    {day.date}
                                                </span>
                                                {day.events.length > 0 && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {day.events.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {day.events.slice(0, 3).map((ev, i) => {
                                                    const config = EVENT_TYPE_CONFIG[ev.event_type] || EVENT_TYPE_CONFIG.custom;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${config.bg} ${config.color} ${ev.is_completed ? "line-through opacity-50" : ""}`}
                                                            title={ev.title}
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    );
                                                })}
                                                {day.events.length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground font-medium pl-1">
                                                        +{day.events.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Event Legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                    <div key={key} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                        {config.icon}
                        {config.label}
                    </div>
                ))}
            </div>

            {/* Selected Date Events Panel */}
            {selectedDate && (
                <Card className="border border-blue-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                                })}
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => openAddModal(selectedDate)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedDate(null)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {selectedDateEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No events on this day. Double-click a date or click &quot;Add&quot; to create one.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selectedDateEvents.map((ev) => {
                                    const config = EVENT_TYPE_CONFIG[ev.event_type] || EVENT_TYPE_CONFIG.custom;
                                    return (
                                        <div
                                            key={`${ev.id}-${ev.title}`}
                                            className={`flex items-center gap-3 p-3 rounded-xl border ${config.border} ${config.bg} transition-all`}
                                        >
                                            <div className={`p-2 rounded-lg ${config.color}`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-sm ${config.color} ${ev.is_completed ? "line-through opacity-60" : ""}`}>
                                                    {ev.title}
                                                </p>
                                                {ev.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.description}</p>
                                                )}
                                                {ev.crop_name && (
                                                    <span className="text-[10px] bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                                                        🌾 {ev.crop_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {ev.id !== 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleEvent(ev.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${
                                                                ev.is_completed
                                                                    ? "bg-green-200 text-green-700 hover:bg-green-300"
                                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                                            }`}
                                                            title={ev.is_completed ? "Mark incomplete" : "Mark complete"}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEvent(ev.id)}
                                                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition-colors"
                                                            title="Delete event"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                {ev.id === 0 && (
                                                    <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Auto</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add Event Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Farm Event"
            >
                <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Event Title *</label>
                        <input
                            required
                            placeholder="e.g. Apply DAP fertilizer"
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 text-foreground bg-background"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Event Type</label>
                            <select
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 text-foreground bg-background"
                                value={newEvent.event_type}
                                onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                            >
                                {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Date *</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 text-foreground bg-background"
                                value={newEvent.event_date}
                                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            placeholder="Optional details..."
                            rows={2}
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 text-foreground bg-background"
                            value={newEvent.description || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Remind me (days before)</label>
                        <select
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 text-foreground bg-background"
                            value={newEvent.reminder_days_before || 1}
                            onChange={(e) => setNewEvent({ ...newEvent, reminder_days_before: parseInt(e.target.value) })}
                        >
                            <option value={0}>No reminder</option>
                            <option value={1}>1 day before</option>
                            <option value={2}>2 days before</option>
                            <option value={3}>3 days before</option>
                            <option value={7}>1 week before</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Event
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
