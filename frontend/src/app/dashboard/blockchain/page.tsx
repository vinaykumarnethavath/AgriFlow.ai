"use client";

import React, { useState, useEffect } from "react";
import { 
    getBlockchainBlocks, 
    verifyBlockchain, 
    getBlockchainStats, 
    tamperBlockchain,
    certifyProduct,
    getMyProducts,
    BlockchainBlock,
    BlockchainStats,
    Product
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    ShieldCheck, 
    ShieldAlert, 
    Database, 
    Layers, 
    RefreshCw, 
    Check, 
    AlertTriangle, 
    Search,
    ChevronDown,
    ChevronUp,
    Lock,
    ExternalLink,
    Binary,
    Coins,
    Award,
    FileSignature,
    PlusCircle
} from "lucide-react";

export default function BlockchainExplorerPage() {
    const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
    const [stats, setStats] = useState<BlockchainStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});
    
    // User's products for issuing certificates
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    
    // Integrity Verification State
    const [verifying, setVerifying] = useState(false);
    const [verificationStep, setVerificationStep] = useState<number | null>(null);
    const [verificationResult, setVerificationResult] = useState<{
        isValid: boolean;
        message: string;
        failingBlockIndex: number | null;
    } | null>(null);

    // Certification Issuance State
    const [certProductId, setCertProductId] = useState("");
    const [certType, setCertType] = useState("organic");
    const [verifierName, setVerifierName] = useState("AgriChain Organic Certification Board");
    const [certDetails, setCertDetails] = useState("Soil health check: Passed\nPesticide residues: None detected\nCultivation standard: 100% Organic Eco-certified");
    const [issuing, setIssuing] = useState(false);

    // Tampering Simulation State
    const [tamperIndex, setTamperIndex] = useState("");
    const [tamperPayload, setTamperPayload] = useState("{\"hacked\": true, \"value\": \"malicious data alter\"}");
    const [tampering, setTampering] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Set default verifier name based on cert type selection
    useEffect(() => {
        if (certType === "organic") {
            setVerifierName("AgriChain Organic Certification Board");
            setCertDetails("Soil health check: Passed\nPesticide residues: None detected\nCultivation standard: 100% Organic Eco-certified");
        } else {
            setVerifierName("Fair-Trade India Association");
            setCertDetails("Farmer wage premium: +20% paid above market\nWorking environment: Safe & Audited\nMinimum support price: Verified met");
        }
    }, [certType]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedBlocks, fetchedStats] = await Promise.all([
                getBlockchainBlocks(),
                getBlockchainStats()
            ]);
            setBlocks(fetchedBlocks);
            setStats(fetchedStats);
            
            // Set verification state initially based on backend stats
            setVerificationResult({
                isValid: fetchedStats.is_ledger_valid,
                message: fetchedStats.is_ledger_valid 
                    ? "Ledger integrity verified. All block hashes chain correctly."
                    : "Cryptographic check failed. Ledger tampering detected!",
                failingBlockIndex: fetchedStats.is_ledger_valid ? null : -1
            });

            // Fetch user products
            try {
                const prods = await getMyProducts();
                setMyProducts(prods);
                if (prods.length > 0) {
                    setCertProductId(prods[0].id.toString());
                }
            } catch (pErr) {
                console.warn("Could not load products for dropdown - using fallback text input", pErr);
            }
        } catch (err) {
            console.error("Failed to load blockchain data", err);
        } finally {
            setLoading(false);
        }
    };

    const runIntegrityScan = async () => {
        setVerifying(true);
        setVerificationResult(null);
        
        // Simulate step-by-step scanning of blocks for a visual effect
        for (let i = 0; i < blocks.length; i++) {
            setVerificationStep(i);
            await new Promise((resolve) => setTimeout(resolve, Math.max(100, 1500 / blocks.length)));
        }
        
        try {
            const result = await verifyBlockchain();
            setVerificationResult({
                isValid: result.is_valid,
                message: result.message,
                failingBlockIndex: result.failing_block_index
            });
            
            // Reload stats to get the updated status
            const updatedStats = await getBlockchainStats();
            setStats(updatedStats);
        } catch (err) {
            console.error(err);
        } finally {
            setVerifying(false);
            setVerificationStep(null);
        }
    };

    const handleIssueCertification = async () => {
        const prodId = parseInt(certProductId);
        if (isNaN(prodId)) {
            alert("Please specify or select a valid product ID.");
            return;
        }

        if (!verifierName.trim()) {
            alert("Please provide the name of the verifier/auditor.");
            return;
        }

        setIssuing(true);
        try {
            // Parse detail lines into helper dict
            const detailDict: Record<string, string> = {};
            certDetails.split("\n").forEach((line, idx) => {
                if (line.includes(":")) {
                    const [key, ...valParts] = line.split(":");
                    detailDict[key.trim()] = valParts.join(":").trim();
                } else {
                    detailDict[`notes_line_${idx + 1}`] = line.trim();
                }
            });

            await certifyProduct({
                product_id: prodId,
                certification_type: certType,
                verifier_name: verifierName,
                details: detailDict
            });

            alert(`Mined block! Certified ${certType.toUpperCase()} status successfully recorded on-chain.`);
            
            // Clear details for next
            setCertDetails("");
            await loadData();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to issue certification: ${err.response?.data?.detail || err.message}`);
        } finally {
            setIssuing(false);
        }
    };

    const triggerTampering = async () => {
        const index = parseInt(tamperIndex);
        if (isNaN(index)) {
            alert("Please enter a valid block index to tamper.");
            return;
        }
        
        setTampering(true);
        try {
            await tamperBlockchain(index, tamperPayload);
            await loadData();
            alert(`Block #${index} payload has been maliciously edited in the database. Run the Integrity Scan to verify!`);
        } catch (err: any) {
            alert(`Error tampering block: ${err.response?.data?.detail || err.message}`);
        } finally {
            setTampering(false);
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedBlocks(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getCertificationBadge = (type?: string) => {
        switch (type) {
            case "organic":
                return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"><Award className="h-3 w-3" /> Organic Certified</span>;
            case "fair-trade":
                return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-200 dark:border-amber-800 flex items-center gap-1"><Coins className="h-3 w-3" /> Fair-Trade Verified</span>;
            case "traceability":
                return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1"><Layers className="h-3 w-3" /> Supply Journey</span>;
            case "genesis":
                return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-purple-200 dark:border-purple-800 flex items-center gap-1"><Lock className="h-3 w-3" /> Genesis Block</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">Standard Event</span>;
        }
    };

    const parsePayload = (payloadStr: string) => {
        try {
            return JSON.parse(payloadStr);
        } catch {
            return { raw: payloadStr };
        }
    };

    const filteredBlocks = blocks.filter(block => {
        const payload = block.payload.toLowerCase();
        const hash = block.hash.toLowerCase();
        const type = (block.certification_type || "").toLowerCase();
        const verifier = (block.verifier_name || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return payload.includes(query) || 
               hash.includes(query) || 
               type.includes(query) || 
               verifier.includes(query) || 
               block.block_index.toString() === query;
    });

    return (
        <div className="min-h-screen bg-green-50/20 dark:bg-zinc-950 p-6 md:p-8 space-y-8 ml-64">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-green-100 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-green-955 dark:text-zinc-50 flex items-center gap-3">
                        <Database className="h-8 w-8 text-green-600" />
                        AgriChain Ledger
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">
                        Cryptographically secure, immutable proof of Organic Certification & Fair-Trade wage distributions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={runIntegrityScan} 
                        disabled={verifying}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <RefreshCw className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
                        {verifying ? "Auditing Hashing Chain..." : "Verify Ledger Integrity"}
                    </Button>
                </div>
            </div>

            {/* Verification Alert Banner */}
            {verificationResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 ${
                    verificationResult.isValid 
                        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400" 
                        : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-800 dark:text-red-400"
                }`}>
                    <div className="mt-1">
                        {verificationResult.isValid ? (
                            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-base flex items-center gap-2">
                            {verificationResult.isValid ? "Ledger Integrity Verified" : "LEDGER SECURITY COMPROMISED!"}
                        </h4>
                        <p className="text-sm opacity-90 mt-0.5">{verificationResult.message}</p>
                        {verificationResult.failingBlockIndex !== null && verificationResult.failingBlockIndex >= 0 && (
                            <p className="text-xs font-semibold mt-2 underline">
                                Error located at Block #{verificationResult.failingBlockIndex}. The hash link of this block doesn't validate against preceding blocks.
                            </p>
                        )}
                    </div>
                    <div className="text-xs font-mono font-bold bg-white/40 dark:bg-black/20 px-2 py-1 rounded">
                        Target: SHA-256 (00*)
                    </div>
                </div>
            )}

            {/* Live Progress Scan Bar */}
            {verifying && (
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border shadow-sm space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-zinc-300">
                        <span className="flex items-center gap-2">
                            <Binary className="h-4 w-4 animate-pulse text-green-500" />
                            Verifying SHA-256 hashes of block headers...
                        </span>
                        <span>
                            Block {verificationStep} of {blocks.length}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-100"
                            style={{ width: `${((verificationStep ?? 0) / (blocks.length - 1 || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* High-level Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Total Ledger Blocks</CardDescription>
                        <CardTitle className="text-3xl font-extrabold text-green-950 dark:text-zinc-50 flex items-center justify-between">
                            {stats?.total_blocks || blocks.length}
                            <Layers className="h-6 w-6 text-green-600 opacity-60" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Organic Certifications</CardDescription>
                        <CardTitle className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
                            {stats?.organic_certifications}
                            <Award className="h-6 w-6 text-emerald-600 opacity-60" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Fair-Trade Audits</CardDescription>
                        <CardTitle className="text-3xl font-extrabold text-amber-800 dark:text-amber-400 flex items-center justify-between">
                            {stats?.fair_trade_verifications}
                            <Coins className="h-6 w-6 text-amber-600 opacity-60" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Ledger Status</CardDescription>
                        <CardTitle className={`text-3xl font-extrabold flex items-center justify-between ${
                            stats?.is_ledger_valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}>
                            {stats?.is_ledger_valid ? "SECURE" : "TAMPERED"}
                            {stats?.is_ledger_valid ? (
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <ShieldAlert className="h-6 w-6 text-red-600" />
                            )}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ledger Block List (Left 2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search & Filter */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search block contents, hashes, certifications, verifiers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-3 h-12 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-green-500 text-sm"
                        />
                    </div>

                    {/* Block List */}
                    <div className="space-y-4">
                        {filteredBlocks.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-zinc-400 font-medium">No blocks found matching "{searchQuery}"</p>
                            </div>
                        ) : (
                            filteredBlocks.map((block) => {
                                const isExpanded = !!expandedBlocks[block.block_index];
                                const payloadData = parsePayload(block.payload);
                                const isTampered = verificationResult && !verificationResult.isValid && verificationResult.failingBlockIndex === block.block_index;
                                
                                return (
                                    <div 
                                        key={block.block_index} 
                                        className={`bg-white dark:bg-zinc-900 rounded-xl border transition-all ${
                                            isTampered 
                                                ? "border-red-400 ring-2 ring-red-500/20" 
                                                : "border-gray-100 dark:border-zinc-800 hover:border-green-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        {/* Block Summary Header */}
                                        <div 
                                            onClick={() => toggleExpand(block.block_index)}
                                            className="p-5 flex items-center justify-between cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                                                    isTampered 
                                                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400" 
                                                        : block.block_index === 0 
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400"
                                                        : "bg-green-100 text-green-800 dark:bg-zinc-800 dark:text-zinc-200"
                                                }`}>
                                                    #{block.block_index}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-bold text-gray-800 dark:text-zinc-200">
                                                            {block.block_index === 0 ? "Genesis Block" : payloadData.action || payloadData.certification_type || "Ledger Block"}
                                                        </h4>
                                                        {getCertificationBadge(block.certification_type)}
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">
                                                        Recorded: {new Date(block.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className="hidden md:inline font-mono text-[10px] bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 px-2 py-1 rounded text-gray-500 dark:text-zinc-400">
                                                    Hash: {block.hash.substring(0, 16)}...
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Block Detail Content */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 dark:border-zinc-800 p-5 bg-gray-50/50 dark:bg-zinc-900/50 space-y-4 rounded-b-xl">
                                                {/* Hashing Headers */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-zinc-500">Block Hash (SHA-256)</span>
                                                        <p className="font-mono text-xs text-gray-700 dark:text-zinc-300 break-all bg-white dark:bg-zinc-900 border dark:border-zinc-850 p-2.5 rounded-lg select-all">
                                                            {block.hash}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-zinc-500">Previous Block Hash</span>
                                                        <p className="font-mono text-xs text-gray-700 dark:text-zinc-300 break-all bg-white dark:bg-zinc-900 border dark:border-zinc-850 p-2.5 rounded-lg select-all">
                                                            {block.previous_hash}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Payload JSON view */}
                                                <div className="space-y-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-zinc-500">Payload Data</span>
                                                    <div className="bg-zinc-950 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-zinc-900">
                                                        <pre className="text-xs font-mono text-zinc-350 leading-relaxed">
                                                            {JSON.stringify(payloadData, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>

                                                {/* Verifier Detail */}
                                                {block.verifier_name && (
                                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-2">
                                                        <span>Auditor/Verifier: <strong className="text-gray-700 dark:text-zinc-200">{block.verifier_name}</strong></span>
                                                        {block.product_id && (
                                                            <a 
                                                                href={`/trace/${block.product_id}`} 
                                                                target="_blank" 
                                                                className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 hover:underline"
                                                            >
                                                                View Public QR Trace
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Ledger Playground / Simulation (Right Column) */}
                <div className="space-y-8">
                    {/* Issuer Console */}
                    <Card className="border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-emerald-950 dark:text-zinc-50 flex items-center gap-2">
                                <FileSignature className="h-5 w-5 text-emerald-600" />
                                Certification Issuer
                            </CardTitle>
                            <CardDescription>Authorize & sign eco-credentials onto the chain</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Target Product</label>
                                {myProducts.length > 0 ? (
                                    <select
                                        value={certProductId}
                                        onChange={(e) => setCertProductId(e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus-visible:ring-1"
                                    >
                                        {myProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            placeholder="Enter Product ID manually"
                                            value={certProductId}
                                            onChange={(e) => setCertProductId(e.target.value)}
                                            className="text-xs"
                                        />
                                        <span className="text-[10px] text-muted-foreground block">
                                            No active products found for your account. Register a crop first or input a valid Product ID manually.
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Certification Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setCertType("organic")}
                                        className={`h-9 text-xs transition-all ${
                                            certType === "organic" 
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" 
                                                : "bg-gray-100 dark:bg-zinc-800 text-foreground hover:bg-gray-200 hover:text-foreground"
                                        }`}
                                    >
                                        Organic Crop
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setCertType("fair-trade")}
                                        className={`h-9 text-xs transition-all ${
                                            certType === "fair-trade" 
                                                ? "bg-amber-600 hover:bg-amber-700 text-white font-bold" 
                                                : "bg-gray-100 dark:bg-zinc-800 text-foreground hover:bg-gray-200 hover:text-foreground"
                                        }`}
                                    >
                                        Fair Trade Audit
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Authorized Verifier</label>
                                <Input
                                    type="text"
                                    value={verifierName}
                                    onChange={(e) => setVerifierName(e.target.value)}
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Audit Reports & Metrics</label>
                                <textarea
                                    rows={4}
                                    value={certDetails}
                                    onChange={(e) => setCertDetails(e.target.value)}
                                    className="w-full text-xs font-mono p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500"
                                    placeholder="Enter audit criteria (Key: Value)"
                                />
                            </div>

                            <Button 
                                onClick={handleIssueCertification}
                                disabled={issuing || !certProductId}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                            >
                                <PlusCircle className="h-4 w-4" />
                                {issuing ? "Mining Block..." : "Mine Certification Block"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tamper Simulation Console */}
                    <Card className="border-red-100 dark:border-red-900/30 bg-white dark:bg-zinc-900 shadow-md">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-red-950 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Tampering Simulator
                            </CardTitle>
                            <CardDescription>Intentionally break the ledger to test verification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Block Index to Hack</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={tamperIndex}
                                    onChange={(e) => setTamperIndex(e.target.value)}
                                    className="border-gray-200 dark:border-zinc-800 text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Modified Payload</label>
                                <textarea
                                    rows={3}
                                    value={tamperPayload}
                                    onChange={(e) => setTamperPayload(e.target.value)}
                                    className="w-full text-xs font-mono p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus-visible:ring-1 focus-visible:ring-red-500"
                                />
                            </div>

                            <Button 
                                onClick={triggerTampering}
                                disabled={tampering || !tamperIndex}
                                className="w-full bg-red-650 hover:bg-red-750 text-white font-semibold transition-all active:scale-95"
                            >
                                {tampering ? "Modifying Block..." : "Inject Malicious Alteration"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
