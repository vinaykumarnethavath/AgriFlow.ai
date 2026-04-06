"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { createProductionBatch, getProductionHistory, getMyProducts, Product, ProductionBatch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Factory, ArrowRight, Activity } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function ProductionPage() {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalBatches = batches.length;
    const totalOutputQty = useMemo(() => batches.reduce((s, b) => s + b.output_qty, 0), [batches]);
    const totalProcessingCost = useMemo(() => batches.reduce((s, b) => s + b.processing_cost, 0), [batches]);
    const avgEfficiency = useMemo(() => batches.length > 0
        ? batches.reduce((s, b) => s + b.efficiency, 0) / batches.length : 0, [batches]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

    // Watch fields for calculations
    const selectedInputId = watch("input_product_id");
    const inputQty = watch("input_qty");
    const outputQty = watch("output_qty");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [history, products] = await Promise.all([
                getProductionHistory(),
                getMyProducts()
            ]);
            setBatches(history);
            setRawMaterials(products.filter(p => p.category === 'raw_material'));
        } catch (error) {
            console.error("Failed to fetch production data:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await createProductionBatch({
                ...data,
                input_qty: parseFloat(data.input_qty),
                output_qty: parseFloat(data.output_qty),
                processing_cost: parseFloat(data.processing_cost),
                input_product_id: parseInt(data.input_product_id)
            });
            fetchData();
            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error("Failed to start batch:", error);
            alert("Failed to start batch. Check input stock.");
        }
    };

    const calculateEfficiency = () => {
        const i = parseFloat(inputQty) || 0;
        const o = parseFloat(outputQty) || 0;
        if (i === 0) return 0;
        return ((o / i) * 100).toFixed(1);
    };

    const selectedProduct = rawMaterials.find(p => p.id.toString() === selectedInputId);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Production & Processing</h1>
                    <p className="text-gray-500">Convert raw materials into finished goods</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Factory className="w-4 h-4 mr-2" /> Start New Batch
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Batches</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{totalBatches}</p>
                        <p className="text-xs text-green-500 mt-1">Production runs</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Avg Efficiency</p>
                        <p className={`text-2xl font-bold mt-1 ${avgEfficiency >= 90 ? "text-green-600" : avgEfficiency >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                            {avgEfficiency.toFixed(1)}%
                        </p>
                        <p className="text-xs text-cyan-500 mt-1">Output / Input</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Processing Cost</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalProcessingCost.toLocaleString()}</p>
                        <p className="text-xs text-purple-500 mt-1">Labour + Power</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Output</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{totalOutputQty.toLocaleString()} kg</p>
                        <p className="text-xs text-blue-500 mt-1">Finished goods produced</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Production Log
                        <span className="ml-auto text-xs font-normal text-gray-400">{batches.length} batches</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Batch No</th>
                                    <th className="px-6 py-4">Output Product</th>
                                    <th className="px-6 py-4 text-right">Input Qty</th>
                                    <th className="px-6 py-4 text-right">Output Qty</th>
                                    <th className="px-6 py-4 text-right">Waste</th>
                                    <th className="px-6 py-4 text-center">Efficiency</th>
                                    <th className="px-6 py-4 text-right">Cost</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {batches.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No production batches run yet.
                                        </td>
                                    </tr>
                                ) : (
                                    batches.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{b.batch_number}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{b.output_product_name}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{b.input_qty} kg</td>
                                            <td className="px-6 py-4 text-right font-semibold">{b.output_qty} {b.output_unit}</td>
                                            <td className="px-6 py-4 text-right text-red-500">{(b.waste_qty || 0).toFixed(1)} kg</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.efficiency >= 90 ? "bg-green-100 text-green-700" : b.efficiency >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                                    {b.efficiency.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-purple-700 font-medium">₹{b.processing_cost.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(b.date).toLocaleDateString("en-IN")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start Production Batch">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2">1. Input (Raw Material)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Select Material</Label>
                                <select {...register("input_product_id", { required: true })} className="w-full p-2 border rounded-md">
                                    <option value="">-- Select Raw Material --</option>
                                    {rawMaterials.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity} {p.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity to Process</Label>
                                <div className="flex gap-2">
                                    <Input type="number" step="0.01" {...register("input_qty", { required: true })} />
                                    <span className="p-2 bg-white border rounded text-gray-500 text-sm flex items-center">{selectedProduct?.unit || 'unit'}</span>
                                </div>
                                {selectedProduct && (
                                    <div className="text-xs text-blue-600">Available: {selectedProduct.quantity} {selectedProduct.unit}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white rounded-full p-2 border shadow-sm">
                            <ArrowRight className="text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">2. Output (Finished Good)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input {...register("output_product_name", { required: true })} placeholder="e.g. Wheat Flour" />
                            </div>
                            <div className="space-y-2">
                                <Label>Output Quantity</Label>
                                <div className="flex gap-2">
                                    <Input type="number" step="0.01" {...register("output_qty", { required: true })} />
                                    <select {...register("output_unit")} className="w-24 p-2 border rounded-md">
                                        <option value="kg">kg</option>
                                        <option value="liter">liter</option>
                                        <option value="packet">pkt</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Processing Cost (₹)</Label>
                            <Input type="number" step="0.01" {...register("processing_cost", { required: true })} placeholder="Total cost (Labor + Power)" />
                        </div>
                        <div className="flex flex-col justify-end pb-2">
                            <div className="text-sm text-gray-600">Expected Efficiency: <span className="font-bold text-gray-800">{calculateEfficiency()}%</span></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Run Batch</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
