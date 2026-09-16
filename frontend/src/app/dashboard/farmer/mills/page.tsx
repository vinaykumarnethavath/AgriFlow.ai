"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Factory, MapPin, Phone, Star, Search, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Mock data for Mills
const MOCK_MILLS = [
    {
        id: 1,
        name: "Sri Lakshmi Narasimha Rice Mill",
        type: "Rice Mill",
        location: "Nizamabad, Telangana",
        distance: "12 km",
        rating: 4.8,
        verified: true,
        phone: "+91 9876543210",
        price_offered: "₹2,200/Quintal (Paddy)",
        capacity: "100 Tons/Day"
    },
    {
        id: 2,
        name: "Kisan Agro Processing Unit",
        type: "Multi-Crop Mill",
        location: "Karnal, Haryana",
        distance: "25 km",
        rating: 4.5,
        verified: true,
        phone: "+91 9988776655",
        price_offered: "₹2,150/Quintal (Wheat)",
        capacity: "250 Tons/Day"
    },
    {
        id: 3,
        name: "Annapurna Dal Mill",
        type: "Dal Mill",
        location: "Indore, Madhya Pradesh",
        distance: "8 km",
        rating: 4.9,
        verified: true,
        phone: "+91 9123456789",
        price_offered: "₹6,500/Quintal (Toor Dal)",
        capacity: "50 Tons/Day"
    },
    {
        id: 4,
        name: "Ranga Reddy Cotton Ginning Mill",
        type: "Cotton Mill",
        location: "Warangal, Telangana",
        distance: "40 km",
        rating: 4.2,
        verified: false,
        phone: "+91 8899001122",
        price_offered: "₹7,000/Quintal (Cotton)",
        capacity: "500 Bales/Day"
    }
];

export default function MillsMarketplace() {
    const searchParams = useSearchParams();
    const cropId = searchParams.get("cropId");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredMills = MOCK_MILLS.filter(mill => 
        mill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        mill.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mill.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Factory className="w-8 h-8 text-blue-600" />
                        Direct Sale to Mills
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Bypass middlemen and sell your harvest directly to verified mills for better profits.
                    </p>
                </div>
                {cropId && (
                    <Link href={`/dashboard/farmer/crops/${cropId}`}>
                        <Button variant="outline">Back to Crop Details</Button>
                    </Link>
                )}
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search mills by name, location, or crop type..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMills.map(mill => (
                    <Card key={mill.id} className="hover:shadow-lg transition-all border-blue-100 bg-white">
                        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white rounded-t-xl border-b border-blue-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-bold text-blue-900">{mill.name}</CardTitle>
                                    <div className="flex items-center gap-1 text-sm text-blue-700 mt-1">
                                        <Factory className="w-3 h-3" /> {mill.type}
                                    </div>
                                </div>
                                {mill.verified && (
                                    <div className="bg-green-100 text-green-700 p-1 rounded-full" title="Verified Mill">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>{mill.location} <span className="font-semibold">({mill.distance})</span></span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                <span>{mill.phone}</span>
                            </div>
                            
                            <div className="p-3 bg-blue-50 rounded-lg mt-2 border border-blue-100">
                                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Current Market Price Offered</p>
                                <p className="text-lg font-bold text-blue-900">{mill.price_offered}</p>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-medium text-amber-700">{mill.rating}</span>
                                </div>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                                    Connect & Sell <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {filteredMills.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Factory className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No mills found matching your search.</p>
                </div>
            )}
        </div>
    );
}
