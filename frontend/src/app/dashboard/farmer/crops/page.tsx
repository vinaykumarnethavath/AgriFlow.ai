"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { Crop } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ArrowLeft, Plus, Sprout, ArrowRight, Stethoscope } from "lucide-react";

export default function CropsListPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Add Crop State
    const [isAddCropOpen, setIsAddCropOpen] = useState(false);
    const [newCrop, setNewCrop] = useState({
        name: "",
        area: "",
        season: "Kharif",
        variety: "",
        sowing_date: new Date().toISOString().split("T")[0],
        expected_harvest_date: "",
        notes: ""
    });
    const [addingCrop, setAddingCrop] = useState(false);

    // Harvest State
    const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [harvestData, setHarvestData] = useState({
        actual_yield: "",
        selling_price_per_unit: "",
        date: new Date().toISOString().split("T")[0]
    });
    const [submittingHarvest, setSubmittingHarvest] = useState(false);
    const [areaValueStr, setAreaValueStr] = useState(""); // For input handling

    // Normalization helper
    const normalizeLandArea = (value: number): number => {
        let acres = Math.floor(value);
        let guntas = Math.round((value - acres) * 100);
        if (guntas >= 40) {
            acres += Math.floor(guntas / 40);
            guntas = guntas % 40;
        }
        return acres + (guntas / 100);
    };

    // Helper: Add land areas in base-40
    const addLandArea = (a: number, b: number): number => {
        const aAcres = Math.floor(a);
        const aGuntas = Math.round((a - aAcres) * 100);
        const bAcres = Math.floor(b);
        const bGuntas = Math.round((b - bAcres) * 100);
        let resAcres = aAcres + bAcres;
        let resGuntas = aGuntas + bGuntas;
        if (resGuntas >= 40) {
            resAcres += Math.floor(resGuntas / 40);
            resGuntas = resGuntas % 40;
        }
        return resAcres + (resGuntas / 100);
    };

    // Helper: Subtract land areas in base-40
    const subtractLandArea = (total: number, minus: number): number => {
        const tAcres = Math.floor(total);
        const tGuntas = Math.round((total - tAcres) * 100);
        const mAcres = Math.floor(minus);
        const mGuntas = Math.round((minus - mAcres) * 100);
        let resAcres = tAcres - mAcres;
        let resGuntas = tGuntas - mGuntas;
        if (resGuntas < 0) {
            resAcres -= 1;
            resGuntas += 40;
        }
        return resAcres + (resGuntas / 100);
    };

    // Helper: Format area for display (Ac.Guntas)
    const formatLandArea = (area: number) => {
        let acres = Math.floor(area);
        let guntas = Math.round((area - acres) * 100);
        if (guntas >= 40) {
            acres += Math.floor(guntas / 40);
            guntas = guntas % 40;
        }
        return `${acres}.${guntas.toString().padStart(2, '0')}`;
    };

    const handleAreaBlurEvent = (value: string, setter: (val: string) => void) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;
        const normalized = normalizeLandArea(num);
        setter(normalized.toFixed(2));
    };

    // Real-time scroll capping: .39 max, then jumps to next acre
    const handleAreaChangeEvent = (value: string, setter: (val: string) => void) => {
        if (value === '' || value === '0' || value === '0.') { setter(value); return; }
        const num = parseFloat(value);
        if (isNaN(num)) { setter(value); return; }

        // Explicitly prevent negative areas
        if (num < 0) {
            setter('0.00');
            return;
        }

        const acres = Math.floor(num);
        const guntas = Math.round((num - acres) * 100);

        // Detect browser step-down from X.00, which results in (X-1).99
        if (guntas > 39) {
            if (guntas >= 90) {
                // Downward scroll from X.00 -> (X-1).99
                setter(`${acres}.39`);
            } else {
                // Upward scroll from X.39 -> X.40
                const newAcres = acres + Math.floor(guntas / 40);
                const newGuntas = guntas % 40;
                setter(`${newAcres}.${newGuntas.toString().padStart(2, '0')}`);
            }
        } else {
            setter(value);
        }
    };

    const activeCropsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cropsRes = await api.get("/crops/");
            setCrops(cropsRes.data);

            const profileRes = await api.get("/farmer/profile");
            setProfile(profileRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to active crops section after loading
    useEffect(() => {
        if (!loading && crops.length > 0 && activeCropsRef.current) {
            setTimeout(() => {
                activeCropsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [loading, crops]);

    // Sort crops: Harvested/Sold first, then Growing
    const sortedCrops = [...crops].sort((a, b) => {
        const statusOrder: Record<string, number> = { 'Harvested': 0, 'Sold': 1, 'Growing': 2 };
        return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    });

    const harvestedCrops = sortedCrops.filter(c => c.status === 'Harvested' || c.status === 'Sold');
    const activeCrops = sortedCrops.filter(c => c.status === 'Growing');

    const handleCreateCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingCrop(true);

        const areaValue = parseFloat(newCrop.area);
        if (isNaN(areaValue) || areaValue <= 0) {
            alert("Please enter a valid area.");
            setAddingCrop(false);
            return;
        }

        // Land utilization validation
        const calculateTotalLand = () => {
            let total = 0;
            const records = profile?.land_records || [];
            records.forEach((lr: any) => {
                total = addLandArea(total, lr.area || 0);
            });
            return total || profile?.total_area || 0;
        };

        const calculateActiveArea = () => {
            let total = 0;
            const currentActiveCrops = crops.filter(c => c.status === 'Growing');
            currentActiveCrops.forEach(c => {
                total = addLandArea(total, c.area || 0);
            });
            return total;
        };

        const totalLandArea = calculateTotalLand();
        const activeCropArea = calculateActiveArea();
        const availableLand = subtractLandArea(totalLandArea, activeCropArea);

        if (totalLandArea > 0 && areaValue > availableLand) {
            alert(`Cannot add crop: Area (${formatLandArea(areaValue)} Ac) exceeds available land (${formatLandArea(availableLand)} Ac).\n\nTotal Land: ${formatLandArea(totalLandArea)} Ac\nActive Crops: ${formatLandArea(activeCropArea)} Ac\nAvailable: ${formatLandArea(availableLand)} Ac\n\nPlease reduce the crop area or update your land records.`);
            setAddingCrop(false);
            return;
        }

        const formatAsISO = (dateStr: string) => {
            if (!dateStr) return null;
            if (dateStr.includes('T')) return dateStr.replace('Z', '');
            return `${dateStr}T00:00:00`;
        };

        const payload = {
            name: newCrop.name,
            area: areaValue,
            season: newCrop.season || "Kharif",
            variety: newCrop.variety || null,
            crop_type: "Other",
            sowing_date: formatAsISO(newCrop.sowing_date) || new Date().toISOString(),
            expected_harvest_date: formatAsISO(newCrop.expected_harvest_date),
            notes: newCrop.notes || null
        };

        try {
            console.log("Creating crop with payload:", payload);
            await api.post("/crops/", payload);
            setIsAddCropOpen(false);
            setNewCrop({
                name: "",
                area: "",
                season: "Kharif",
                variety: "",
                sowing_date: new Date().toISOString().split("T")[0],
                expected_harvest_date: "",
                notes: ""
            });
            fetchData();
        } catch (error: any) {
            console.error("Create crop error:", error.response?.data || error);
            const msg = error.response?.data?.detail
                ? (Array.isArray(error.response.data.detail)
                    ? error.response.data.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join("\n")
                    : error.response.data.detail)
                : "Failed to create crop. Please check all fields.";
            alert(msg);
        } finally {
            setAddingCrop(false);
        }
    };

    const handleOpenHarvestModal = (crop: Crop) => {
        setSelectedCrop(crop);
        setHarvestData({
            actual_yield: crop.actual_yield?.toString() || "",
            selling_price_per_unit: crop.selling_price_per_unit?.toString() || "",
            date: crop.actual_harvest_date ? new Date(crop.actual_harvest_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
        });
        setIsHarvestModalOpen(true);
    };

    const handleRecordHarvest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCrop) return;
        setSubmittingHarvest(true);

        try {
            await api.post(`/farmer/crops/${selectedCrop.id}/harvest`, {
                actual_yield: parseFloat(harvestData.actual_yield),
                selling_price: parseFloat(harvestData.selling_price_per_unit),
                date: harvestData.date
            });
            setIsHarvestModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Harvest error:", error);
            alert("Failed to record harvest");
        } finally {
            setSubmittingHarvest(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-green-600 font-bold animate-pulse">{t('common.loading')}</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push("/dashboard/farmer")}>
                        <ArrowLeft className="w-5 h-5 mr-2" /> {t('common.back')}
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-green-900">{t('farmer.myCrops')}</h1>
                        <p className="text-muted-foreground">{t('crops.manageDesc')}</p>
                    </div>
                </div>
                <Button onClick={() => setIsAddCropOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" /> {t('farmer.addCrop')}
                </Button>
            </div>

            {/* Harvested/Sold Crops Section */}
            {harvestedCrops.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                        {t('crops.harvestedSold')} ({harvestedCrops.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {harvestedCrops.map(crop => (
                            <Link key={crop.id} href={`/dashboard/farmer/crops/${crop.id}`} className="block group">
                                <Card className="h-full border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all opacity-80 hover:opacity-100">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-foreground group-hover:text-purple-700 transition-colors">
                                                    <span className="mr-1.5">{crop.name.toLowerCase().includes('chili') || crop.name.toLowerCase().includes('chilli') ? '🌶️' :
                                                        crop.name.toLowerCase().includes('groundnut') || crop.name.toLowerCase().includes('peanut') ? '🥜' :
                                                            crop.name.toLowerCase().includes('rice') || crop.name.toLowerCase().includes('paddy') ? '🌾' :
                                                                crop.name.toLowerCase().includes('cotton') ? '☁️' :
                                                                    crop.name.toLowerCase().includes('wheat') ? '🌾' :
                                                                        '🌿'}</span>
                                                    {crop.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{crop.area} Acres</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${crop.status === 'Harvested' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {crop.status}
                                            </span>
                                        </div>
                                        {/* Dates and Yield */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t('farmer.sowingDate')}:</span>
                                                <span className="font-medium">{new Date(crop.sowing_date).toLocaleDateString()}</span>
                                            </div>
                                            {crop.expected_harvest_date && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-purple-600 font-medium">{t('farmer.harvestDate')}:</span>
                                                    <span className="font-bold text-purple-700">{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {crop.actual_yield && (
                                                <div className="flex justify-between text-sm bg-purple-50 p-2 rounded-lg">
                                                    <span className="text-muted-foreground">{t('crops.totalYield')}:</span>
                                                    <span className="font-bold text-purple-700">{crop.actual_yield} {t('crops.bags')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('farmer.totalCost')}</p>
                                                <p className="font-bold text-foreground">₹{(crop.total_cost || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{t('farmer.revenue')}</p>
                                                <p className="font-bold text-green-600">₹{(crop.total_revenue || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-purple-600 hover:bg-purple-50"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenHarvestModal(crop);
                                                }}
                                            >
                                                {t('crops.editHarvest')}
                                            </Button>
                                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Crops Section */}
            <div ref={activeCropsRef}>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    {t('farmer.activeCrops')} ({activeCrops.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {crops.length === 0 ? (
                        <div className="col-span-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                            <Sprout className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-bold text-foreground mb-2">{t('farmer.noCrops')}</h3>
                            <p className="text-muted-foreground mb-4">{t('crops.addFirstCropDesc')}</p>
                            <Button onClick={() => setIsAddCropOpen(true)} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" /> {t('crops.addFirstCrop')}
                            </Button>
                        </div>
                    ) : activeCrops.length === 0 ? (
                        <div className="col-span-3 bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-8 text-center">
                            <Sprout className="h-12 w-12 mx-auto mb-3 text-green-400" />
                            <p className="font-medium text-green-700">{t('farmer.noActiveCrops')}</p>
                            <p className="text-sm text-green-600 mb-4">{t('crops.allHarvested')}</p>
                            <Button onClick={() => setIsAddCropOpen(true)} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" /> {t('farmer.addCrop')}
                            </Button>
                        </div>
                    ) : (
                        activeCrops.map(crop => (
                            <Link key={crop.id} href={`/dashboard/farmer/crops/${crop.id}`} className="block group">
                                <Card className="h-full border-green-100 hover:border-green-300 hover:shadow-lg transition-all bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-card">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-foreground group-hover:text-green-700 transition-colors">
                                                    <span className="mr-1.5">{crop.name.toLowerCase().includes('chili') || crop.name.toLowerCase().includes('chilli') ? '🌶️' :
                                                        crop.name.toLowerCase().includes('groundnut') || crop.name.toLowerCase().includes('peanut') ? '🥜' :
                                                            crop.name.toLowerCase().includes('rice') || crop.name.toLowerCase().includes('paddy') ? '🌾' :
                                                                crop.name.toLowerCase().includes('cotton') ? '☁️' :
                                                                    crop.name.toLowerCase().includes('wheat') ? '🌾' :
                                                                        '🌿'}</span>
                                                    {crop.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{crop.area} {t('farmer.acres')}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                {crop.status === 'Growing' ? t('status.growing') : crop.status === 'Harvested' ? t('status.harvested') : t('status.sold')}
                                            </span>
                                        </div>
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t('farmer.sowingDate')}:</span>
                                                <span className="font-medium">{new Date(crop.sowing_date).toLocaleDateString()}</span>
                                            </div>
                                            {crop.expected_harvest_date && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{t('farmer.harvestDate')}:</span>
                                                    <span className="font-medium">{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('farmer.totalCost')}</p>
                                                <p className="font-bold text-foreground">₹{(crop.total_cost || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{t('crops.expectedRevenue')}</p>
                                                <p className="font-bold text-foreground">₹{(crop.total_revenue || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleOpenHarvestModal(crop);
                                                    }}
                                                >
                                                    {t('crops.recordHarvest')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-indigo-600 hover:bg-indigo-50"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        router.push(`/dashboard/farmer/crops/${crop.id}?tab=health`);
                                                    }}
                                                >
                                                    <Stethoscope className="h-4 w-4 mr-1" /> {t('crops.healthCheck')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Navigate specifically to expenses tab if possible, or just the page
                                                        router.push(`/dashboard/farmer/crops/${crop.id}?tab=expenses`);
                                                    }}
                                                >
                                                    {t('farmer.addExpense')}
                                                </Button>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Harvest Modal */}
            <Modal
                isOpen={isHarvestModalOpen}
                onClose={() => setIsHarvestModalOpen(false)}
                title={`${t('crops.recordHarvest')}: ${selectedCrop?.name}`}
            >
                <form onSubmit={handleRecordHarvest} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('crops.actualYield')}</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={harvestData.actual_yield}
                                onChange={(e) => setHarvestData({ ...harvestData, actual_yield: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('farmer.harvestDate')}</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={harvestData.date}
                                onChange={(e) => setHarvestData({ ...harvestData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('crops.sellingPrice')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full border rounded-lg p-2 pl-7 outline-none focus:ring-2 focus:ring-green-500"
                                    value={harvestData.selling_price_per_unit}
                                    onChange={(e) => setHarvestData({ ...harvestData, selling_price_per_unit: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-700">{t('crops.totalRevenue')}:</span>
                            <span className="font-bold text-blue-900">
                                ₹{((parseFloat(harvestData.actual_yield) || 0) * (parseFloat(harvestData.selling_price_per_unit) || 0)).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-600">{t('farmer.totalCost')}:</span>
                            <span className="font-bold text-red-700">
                                - ₹{(selectedCrop?.total_cost || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-blue-200 flex justify-between font-bold">
                            <span className="text-blue-900">{t('crops.estimatedProfit')}:</span>
                            <span className={`${((parseFloat(harvestData.actual_yield) || 0) * (parseFloat(harvestData.selling_price_per_unit) || 0) - (selectedCrop?.total_cost || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{(((parseFloat(harvestData.actual_yield) || 0) * (parseFloat(harvestData.selling_price_per_unit) || 0)) - (selectedCrop?.total_cost || 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={submittingHarvest}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    >
                        {submittingHarvest ? t('common.loading') : t('crops.recordAndClose')}
                    </Button>
                </form>
            </Modal>

            {/* Add Crop Modal */}
            <Modal
                isOpen={isAddCropOpen}
                onClose={() => setIsAddCropOpen(false)}
                title={t('farmer.addCrop')}
            >
                <form onSubmit={handleCreateCrop} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('farmer.cropName')}</label>
                            <input
                                required
                                placeholder="e.g. Wheat, Rice, Cotton"
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={newCrop.name}
                                onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('crops.variety')}</label>
                            <input
                                placeholder="e.g. Basmati, HYV"
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={newCrop.variety}
                                onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('crops.season')}</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                value={newCrop.season}
                                onChange={(e) => setNewCrop({ ...newCrop, season: e.target.value })}
                            >
                                <option value="Kharif">{t('crops.kharif')}</option>
                                <option value="Rabi">{t('crops.rabi')}</option>
                                <option value="Zaid">{t('crops.zaid')}</option>
                                <option value="Year-round">{t('crops.yearRound')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('crops.areaLabel')}</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500 text-foreground"
                                value={newCrop.area}
                                onChange={(e) => handleAreaChangeEvent(e.target.value, (val) => setNewCrop({ ...newCrop, area: val }))}
                                onBlur={(e) => handleAreaBlurEvent(e.target.value, (val) => setNewCrop({ ...newCrop, area: val }))}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Max .39 guntas per acre (e.g. 1.39 → 2.00)</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('farmer.sowingDate')}</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={newCrop.sowing_date}
                                onChange={(e) => setNewCrop({ ...newCrop, sowing_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('farmer.harvestDate')}</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                                value={newCrop.expected_harvest_date}
                                onChange={(e) => setNewCrop({ ...newCrop, expected_harvest_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('farmer.notes')}</label>
                        <textarea
                            placeholder="Any specific details..."
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                            value={newCrop.notes}
                            onChange={(e) => setNewCrop({ ...newCrop, notes: e.target.value })}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={addingCrop}
                        className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                    >
                        {addingCrop ? t('common.loading') : t('farmer.addCrop')}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
