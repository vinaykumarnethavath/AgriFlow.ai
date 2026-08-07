"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Sprout, 
    User, 
    Calendar, 
    MapPin, 
    CheckCircle, 
    Clock, 
    ShieldCheck, 
    ShieldAlert, 
    Award, 
    Coins, 
    Database, 
    RefreshCw, 
    Check, 
    Lock,
    ExternalLink
} from "lucide-react";

interface TraceEvent {
    id: number;
    action: string;
    details: string;
    timestamp: string;
    actor_id: number;
}

interface ProductDetails {
    id: number;
    name: string;
    category: string;
    description: string;
    batch_number: string;
    quantity: number;
}

interface FarmerDetails {
    name: string;
    is_verified: boolean;
}

interface BlockchainBlock {
    id: number;
    block_index: number;
    timestamp: string;
    previous_hash: string;
    hash: string;
    payload: string;
    product_id?: number;
    certification_type?: string;
    verifier_name?: string;
}

export default function TraceabilityPage() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<{
        product: ProductDetails;
        farmer: FarmerDetails;
        events: TraceEvent[];
        blockchain_blocks?: BlockchainBlock[];
    } | null>(null);

    // Audit State
    const [auditing, setAuditing] = useState(false);
    const [auditSuccess, setAuditSuccess] = useState<boolean | null>(null);
    const [scannedBlocks, setScannedBlocks] = useState<number>(0);

    useEffect(() => {
        if (id) {
            fetchTraceability();
        }
    }, [id]);

    const fetchTraceability = async () => {
        try {
            const response = await api.get(`/traceability/public/${id}`);
            setData(response.data);
        } catch (err) {
            console.error("Failed to fetch traceability:", err);
            setError("Product not found or invalid QR code.");
        } finally {
            setLoading(false);
        }
    };

    const runBlockchainAudit = async () => {
        if (!data?.blockchain_blocks || data.blockchain_blocks.length === 0) return;
        
        setAuditing(true);
        setAuditSuccess(null);
        setScannedBlocks(0);

        const totalBlocks = data.blockchain_blocks.length;
        
        // Visual steps scanning blocks
        for (let i = 1; i <= totalBlocks; i++) {
            setScannedBlocks(i);
            await new Promise((resolve) => setTimeout(resolve, Math.max(150, 1000 / totalBlocks)));
        }

        // Send validation request to backend to confirm cryptographically
        try {
            const response = await api.get("/blockchain/verify");
            setAuditSuccess(response.data.is_valid);
        } catch (err) {
            console.error("Blockchain validation failed", err);
            setAuditSuccess(false);
        } finally {
            setAuditing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-green-50/30 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                    <p className="text-green-800 font-semibold animate-pulse">Consulting Decentralized Ledger...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-green-50/20 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-100 shadow-xl">
                    <CardContent className="p-8 text-center">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-650">
                            <ShieldAlert className="h-8 w-8" />
                        </div>
                        <h1 className="text-xl font-extrabold text-gray-800 mb-2">Verification Failed</h1>
                        <p className="text-gray-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if we have organic or fair-trade blocks in the blockchain
    const hasOrganicCert = data.blockchain_blocks?.some(b => b.certification_type === "organic");
    const hasFairTradeCert = data.blockchain_blocks?.some(b => b.certification_type === "fair-trade");
    const organicBlock = data.blockchain_blocks?.find(b => b.certification_type === "organic");
    const fairTradeBlock = data.blockchain_blocks?.find(b => b.certification_type === "fair-trade");

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center mb-2">
                        <img src="/logo.png" alt="AgriFlow Logo" className="h-16 w-16 object-contain" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-green-955">{data.product.name}</h1>
                    <p className="text-green-700 font-semibold tracking-wide flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Verified Blockchain Product Journey
                    </p>
                </div>

                {/* Product & Farmer Main Card */}
                <Card className="border-green-100/80 shadow-xl overflow-hidden rounded-2xl bg-white">
                    <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                        <span className="font-mono bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            Batch: {data.product.batch_number}
                        </span>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider">
                            {data.product.category}
                        </span>
                    </div>
                    <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-700">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Grown by</p>
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        {data.farmer.name}
                                        {data.farmer.is_verified && (
                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                        )}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-700">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Origin</p>
                                    <p className="font-semibold text-gray-700">Andhra Pradesh, India</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center">
                            <p className="text-sm text-gray-600 italic">"{data.product.description || "Fresh farm products cultivated under premium agricultural practices."}"</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Blockchain Certification Stamps */}
                {(hasOrganicCert || hasFairTradeCert) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {hasOrganicCert && (
                            <Card className="border-emerald-100 bg-emerald-50/20 dark:bg-emerald-950/5 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                                        <Award className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-emerald-900 text-base">Certified Organic</h4>
                                        <p className="text-xs text-gray-500">Verified ecological cultivation. No chemical pesticides used.</p>
                                        <div className="pt-2 text-[10px] text-emerald-800 font-mono flex items-center gap-1">
                                            <span>Verifier: {organicBlock?.verifier_name}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {hasFairTradeCert && (
                            <Card className="border-amber-100 bg-amber-50/20 dark:bg-amber-950/5 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                                        <Coins className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-amber-900 text-base">Fair-Trade Verified</h4>
                                        <p className="text-xs text-gray-500">Audited transaction. Fair price guaranteed to farmer.</p>
                                        <div className="pt-2 text-[10px] text-amber-800 font-mono flex items-center gap-1">
                                            <span>Auditor: {fairTradeBlock?.verifier_name}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Interactive Blockchain Audit Component */}
                {data.blockchain_blocks && data.blockchain_blocks.length > 0 && (
                    <Card className="border-green-100/50 shadow-md bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-green-50/40 pb-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-bold text-green-900 flex items-center gap-2">
                                    <Database className="h-5 w-5 text-green-600" />
                                    Ledger Audit Trail
                                </CardTitle>
                                <button 
                                    onClick={runBlockchainAudit}
                                    disabled={auditing}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white disabled:text-gray-500 text-xs px-3.5 py-2 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                                >
                                    <RefreshCw className={`h-3 w-3 ${auditing ? "animate-spin" : ""}`} />
                                    {auditing ? "Scanning Ledger..." : "Audit Ledger"}
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Scanning Progress */}
                            {auditing && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                                        <span>Cryptographic proof-of-work validation:</span>
                                        <span>Block {scannedBlocks} of {data.blockchain_blocks.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-green-500 h-full rounded-full transition-all duration-75"
                                            style={{ width: `${(scannedBlocks / data.blockchain_blocks.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Audit Result Banner */}
                            {auditSuccess !== null && (
                                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                                    auditSuccess 
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                        : "bg-red-50 border-red-200 text-red-800"
                                }`}>
                                    <div>
                                        {auditSuccess ? (
                                            <ShieldCheck className="h-5 w-5 text-emerald-650" />
                                        ) : (
                                            <ShieldAlert className="h-5 w-5 text-red-650" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-xs">
                                        <span className="font-bold block">
                                            {auditSuccess ? "Ledger Verified Cryptographically" : "Ledger Chain Check Failed!"}
                                        </span>
                                        <span className="opacity-90">
                                            {auditSuccess 
                                                ? "Every hash chains flawlessly back to the Genesis block. No modifications detected."
                                                : "The database records do not match the cryptographic signature chain. Tampering detected."}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Display Block summary list */}
                            <div className="space-y-2.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blockchain Blocks</span>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {data.blockchain_blocks.map((block) => (
                                        <div key={block.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-7 w-7 rounded-lg bg-green-100 text-green-800 flex items-center justify-center font-mono font-bold">
                                                    #{block.block_index}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-700 capitalize">
                                                        {block.certification_type === "genesis" ? "Genesis Block" : block.certification_type || "Event Entry"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block mt-0.5 font-mono break-all">
                                                        Hash: {block.hash.substring(0, 24)}...
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                Nonce: {block.nonce}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timeline Events */}
                <div className="space-y-4">
                    <h3 className="font-extrabold text-green-950 text-lg flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Chronological Product Journey
                    </h3>
                    <div className="relative pl-8 border-l-2 border-green-200 space-y-8">
                        {data.events.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No timeline events recorded yet.
                            </div>
                        ) : (
                            data.events.map((event) => (
                                <div key={event.id} className="relative">
                                    {/* Dot */}
                                    <div className="absolute -left-[41px] top-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                                    </div>

                                    <Card className="border-gray-100 hover:shadow-md transition-shadow rounded-xl">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h4 className="font-bold text-gray-805 text-sm sm:text-base capitalize">{event.action}</h4>
                                                <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(event.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{event.details}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-green-600" />
                        Secured by <span className="font-bold text-green-650">AgriChain</span> Cryptographic Ledger
                    </p>
                </div>
            </div>
        </div>
    );
}
