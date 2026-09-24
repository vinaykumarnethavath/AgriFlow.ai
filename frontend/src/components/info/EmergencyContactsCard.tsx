"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    PhoneCall, Phone, ShieldAlert, Plus, Zap, Droplets,
    Stethoscope, Wrench, Building2, Store, Clock, CheckCircle2,
    Trash2, Edit3, AlertTriangle, ExternalLink, RefreshCw, LifeBuoy
} from "lucide-react";
import {
    EmergencyContact, EmergencyContactCreate,
    getEmergencyContacts, createEmergencyContact, deleteEmergencyContact
} from "@/lib/api";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    national_helpline: {
        label: "National Helpline",
        icon: <ShieldAlert className="h-3.5 w-3.5" />,
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200"
    },
    kvk_agriculture_officer: {
        label: "KVK / Agronomist",
        icon: <Building2 className="h-3.5 w-3.5" />,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200"
    },
    electricity_power: {
        label: "Electricity / Lineman",
        icon: <Zap className="h-3.5 w-3.5" />,
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200"
    },
    water_irrigation: {
        label: "Canal & Irrigation",
        icon: <Droplets className="h-3.5 w-3.5" />,
        color: "text-cyan-700 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200"
    },
    veterinary: {
        label: "Veterinary Doctor",
        icon: <Stethoscope className="h-3.5 w-3.5" />,
        color: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/30 border-rose-200"
    },
    machinery_mechanic: {
        label: "Machinery / Harvester",
        icon: <Wrench className="h-3.5 w-3.5" />,
        color: "text-purple-700 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/30 border-purple-200"
    },
    input_retailer: {
        label: "Input Retailer / Shop",
        icon: <Store className="h-3.5 w-3.5" />,
        color: "text-teal-700 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-900/30 border-teal-200"
    },
    other: {
        label: "Local Contact",
        icon: <Phone className="h-3.5 w-3.5" />,
        color: "text-gray-700 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-800/30 border-gray-200"
    }
};

export default function EmergencyContactsCard() {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<EmergencyContactCreate>({
        name: "",
        category: "electricity_power",
        phone_number: "",
        alternate_phone: "",
        department_or_village: "",
        is_toll_free: false,
        availability_hours: "24/7",
        notes: ""
    });

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await getEmergencyContacts();
            setContacts(data);
        } catch (err) {
            console.error("Failed to load emergency contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createEmergencyContact({
                ...formData,
                alternate_phone: formData.alternate_phone || undefined,
                department_or_village: formData.department_or_village || undefined,
                notes: formData.notes || undefined
            });
            setIsAddModalOpen(false);
            setFormData({
                name: "",
                category: "electricity_power",
                phone_number: "",
                alternate_phone: "",
                department_or_village: "",
                is_toll_free: false,
                availability_hours: "24/7",
                notes: ""
            });
            loadContacts();
        } catch (err) {
            console.error("Failed to create emergency contact:", err);
            alert("Failed to save contact.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this personal contact?")) return;
        try {
            await deleteEmergencyContact(id);
            loadContacts();
        } catch (err) {
            console.error("Failed to delete contact:", err);
            alert("Failed to delete contact.");
        }
    };

    // Filter contacts
    const filteredContacts = contacts.filter((c) => {
        if (activeTab === "all") return true;
        if (activeTab === "custom") return !c.is_system_contact;
        return c.category === activeTab;
    });

    return (
        <Card className="border border-border/60 shadow-sm overflow-hidden bg-gradient-to-br from-card via-background to-muted/20">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
                            <LifeBuoy className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-foreground">Emergency SOS & Helplines</h3>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                                    Instant Direct-Dial
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Critical 24/7 agricultural crisis hotlines, KVK scientists, tube well linemen, and veterinary doctors.
                            </p>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Local Contact
                    </Button>
                </div>

                {/* Priority 3-Box SOS Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Kisan Call Center */}
                    <div className="p-3.5 rounded-xl border border-emerald-300/80 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                                Agronomy & Pests Helpline
                            </span>
                            <h4 className="text-sm font-black text-foreground">Kisan Call Center</h4>
                            <p className="text-xs text-muted-foreground">Toll-free in 22 languages</p>
                        </div>
                        <a
                            href="tel:18001801551"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 transition-transform active:scale-95"
                        >
                            <PhoneCall className="h-3.5 w-3.5" /> 1551
                        </a>
                    </div>

                    {/* PMFBY Loss Reporting */}
                    <div className="p-3.5 rounded-xl border border-rose-300/80 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
                                72-Hour Calamity Claim
                            </span>
                            <h4 className="text-sm font-black text-foreground">Crop Loss Helpline</h4>
                            <p className="text-xs text-muted-foreground">Flood / Drought intimation</p>
                        </div>
                        <a
                            href="tel:14447"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs shrink-0 transition-transform active:scale-95"
                        >
                            <PhoneCall className="h-3.5 w-3.5" /> 14447
                        </a>
                    </div>

                    {/* Electricity Transformer Breakdown */}
                    <div className="p-3.5 rounded-xl border border-amber-300/80 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                                Transformer / Power Trip
                            </span>
                            <h4 className="text-sm font-black text-foreground">Rural Discom Helpline</h4>
                            <p className="text-xs text-muted-foreground">24/7 Agricultural Feeder</p>
                        </div>
                        <a
                            href="tel:1912"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs shrink-0 transition-transform active:scale-95"
                        >
                            <PhoneCall className="h-3.5 w-3.5" /> 1912
                        </a>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium border-b border-border/40 pb-3">
                    {[
                        { id: "all", label: "All Contacts" },
                        { id: "national_helpline", label: "National Helplines" },
                        { id: "electricity_power", label: "Power & Lineman" },
                        { id: "veterinary", label: "Veterinary Doctor" },
                        { id: "kvk_agriculture_officer", label: "KVK Scientists" },
                        { id: "water_irrigation", label: "Canal & Water" },
                        { id: "custom", label: "My Saved Contacts" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? "bg-foreground text-background font-bold shadow-xs"
                                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contact List */}
                {loading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                        Loading emergency contact directory...
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl p-6 border border-dashed border-border/60">
                        No contacts found in this category. Click "+ Add Local Contact" to save your local lineman, veterinary doctor, or agro-dealer.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredContacts.map((c) => {
                            const cat = CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.other;

                            return (
                                <div
                                    key={c.id}
                                    className="p-3.5 rounded-xl border border-border/60 bg-card hover:border-emerald-500/30 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                                    {c.name}
                                                    {c.is_toll_free && (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                            Toll-Free
                                                        </span>
                                                    )}
                                                </h4>
                                                {c.department_or_village && (
                                                    <p className="text-xs text-muted-foreground">{c.department_or_village}</p>
                                                )}
                                            </div>

                                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${cat.bg} ${cat.color} shrink-0`}>
                                                {cat.icon}
                                                {cat.label}
                                            </span>
                                        </div>

                                        {c.notes && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {c.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Numbers & Call Button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[11px]">{c.availability_hours}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!c.is_system_contact && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(c.id)}
                                                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                    title="Delete Contact"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}

                                            <a
                                                href={`tel:${c.phone_number}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                                            >
                                                <Phone className="h-3 w-3" />
                                                <span>{c.phone_number}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {/* Modal: Add Personal Contact */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Local Emergency Contact"
            >
                <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Contact Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Patel (Feeder Lineman) or Dr. Verma Vet"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="electricity_power">Electricity / Lineman</option>
                                <option value="veterinary">Veterinary Doctor</option>
                                <option value="kvk_agriculture_officer">KVK / Agriculture Officer</option>
                                <option value="water_irrigation">Canal & Irrigation Officer</option>
                                <option value="machinery_mechanic">Tractor / Harvester Mechanic</option>
                                <option value="input_retailer">Agro-Chemical / Seed Dealer</option>
                                <option value="national_helpline">Government Hotline</option>
                                <option value="other">Other Local Support</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                placeholder="e.g. +91 98765 43210"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Alternate Phone</label>
                            <input
                                type="tel"
                                placeholder="e.g. 0562 234567"
                                value={formData.alternate_phone || ""}
                                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Substation / Village / Office</label>
                            <input
                                type="text"
                                placeholder="e.g. 33kV Substation, Bichpuri"
                                value={formData.department_or_village || ""}
                                onChange={(e) => setFormData({ ...formData, department_or_village: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Operating Hours</label>
                            <input
                                type="text"
                                placeholder="e.g. 24/7 or 08:00 AM - 08:00 PM"
                                value={formData.availability_hours || "24/7"}
                                onChange={(e) => setFormData({ ...formData, availability_hours: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="is_toll_free"
                                checked={formData.is_toll_free}
                                onChange={(e) => setFormData({ ...formData, is_toll_free: e.target.checked })}
                                className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="is_toll_free" className="text-xs text-foreground cursor-pointer font-medium">
                                Is this a Toll-Free number?
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Special Notes</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Call for tube well phase trip or transformer spark in North Sector."
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Save Emergency Contact
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
