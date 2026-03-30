import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { ProductBatchReceiveInfo, BulkProductReceive, bulkReceiveStock } from "@/lib/api";

interface ReceiveStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = ["fertilizer", "seeds", "pesticides", "machinery", "crop"];

export default function ReceiveStockModal({ isOpen, onClose, onSuccess }: ReceiveStockModalProps) {
    const [items, setItems] = useState<ProductBatchReceiveInfo[]>([{
        name: "",
        category: "fertilizer",
        brand: "",
        batch_number: "",
        cost_price: 0,
        selling_price: 0,
        quantity: 1,
        unit: "kg",
    }]);

    const [totalTransport, setTotalTransport] = useState<number>(0);
    const [totalLabour, setTotalLabour] = useState<number>(0);
    const [totalOther, setTotalOther] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const handleItemChange = (index: number, field: keyof ProductBatchReceiveInfo, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, {
            name: "",
            category: "fertilizer",
            brand: "",
            batch_number: "",
            cost_price: 0,
            selling_price: 0,
            quantity: 1,
            unit: "kg",
        }]);
    };

    const removeItemRow = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        for (const item of items) {
            if (!item.name || !item.batch_number || item.cost_price <= 0 || item.selling_price <= 0 || item.quantity <= 0) {
                alert("Please fill all required fields correctly for all items.");
                return;
            }
        }

        setLoading(true);
        try {
            const payload: BulkProductReceive = {
                items: items,
                total_transport_cost: totalTransport,
                total_labour_cost: totalLabour,
                total_other_cost: totalOther,
                expense_notes: "Bulk stock received via workflow."
            };

            await bulkReceiveStock(payload);
            alert("Stock received successfully and expenses apportioned!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert("Failed to receive stock: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Receive Stock Delivery">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-green-800">Products Received</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>
                    </div>
                    
                    {items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                            {items.length > 1 && (
                                <button 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    onClick={() => removeItemRow(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Product Name *</Label>
                                    <Input value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} placeholder="e.g. Paddy" />
                                </div>
                                <div>
                                    <Label>Category *</Label>
                                    <select 
                                        className="w-full p-2 border rounded focus:ring-1 focus:ring-green-500"
                                        value={item.category} 
                                        onChange={(e) => handleItemChange(index, "category", e.target.value)}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <Label>Brand (Optional)</Label>
                                    <Input value={item.brand || ""} onChange={(e) => handleItemChange(index, "brand", e.target.value)} placeholder="Brand Name" />
                                </div>
                                <div>
                                    <Label>Batch Number *</Label>
                                    <Input value={item.batch_number} onChange={(e) => handleItemChange(index, "batch_number", e.target.value)} placeholder="e.g. B-101" />
                                </div>
                                <div>
                                    <Label>Cost Price (Per unit) *</Label>
                                    <Input type="number" min="0" value={item.cost_price || ""} onChange={(e) => handleItemChange(index, "cost_price", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <Label>Selling Price *</Label>
                                    <Input type="number" min="0" value={item.selling_price || ""} onChange={(e) => handleItemChange(index, "selling_price", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <Label>Quantity *</Label>
                                    <Input type="number" min="1" value={item.quantity || ""} onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <Label>Unit</Label>
                                    <select 
                                        className="w-full p-2 border rounded focus:ring-1 focus:ring-green-500"
                                        value={item.unit} 
                                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="bags">bags</option>
                                        <option value="packets">packets</option>
                                        <option value="liters">liters</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg text-green-800">Shared Overhead Expenses</h3>
                    <p className="text-sm text-gray-600">These will be mathematically divided among the above products relative to each product's base cost weight (quantity × cost price) and added correctly to the Inventory landed cost.</p>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label>Total Transport (₹)</Label>
                            <Input type="number" min="0" value={totalTransport || ""} onChange={(e) => setTotalTransport(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                            <Label>Total Labour (₹)</Label>
                            <Input type="number" min="0" value={totalLabour || ""} onChange={(e) => setTotalLabour(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                            <Label>Total Other (₹)</Label>
                            <Input type="number" min="0" value={totalOther || ""} onChange={(e) => setTotalOther(parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
                <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? "Receiving..." : "Receive Delivery"}
                </Button>
            </div>
        </Modal>
    );
}
