"use client";

import React, { useEffect, useState } from "react";
import { getMyOrders, CustomerOrder } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Package, Clock } from "lucide-react";
import ContactInfoCard from "@/components/ui/ContactInfoCard";

export default function OrdersPage() {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground text-center mb-8">Your Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {orders.map((order) => (
                        <AccordionItem key={order.id} value={`item-${order.id}`} className="border rounded-lg bg-white overflow-hidden">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-2 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-full text-green-700">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">Order #{order.id}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Total</div>
                                            <div className="font-bold text-foreground">₹{order.total_amount.toFixed(2)}</div>
                                        </div>
                                        <Badge className={`uppercase ${order.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 py-4 bg-gray-50 border-t space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground">Items Ordered</h4>
                                <ul className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                                            <div className="font-medium text-foreground">
                                                {item.product_name} <span className="text-muted-foreground font-normal">x {item.quantity}</span>
                                            </div>
                                            <div className="text-muted-foreground">₹{item.price} / unit</div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Seller Contact Details - deduplicated by seller_id */}
                                {(() => {
                                    const seenSellerIds = new Set<number>();
                                    const uniqueContacts = order.items
                                        .filter((item) => {
                                            if (!item.seller_contact || seenSellerIds.has(item.seller_id)) return false;
                                            seenSellerIds.add(item.seller_id);
                                            return true;
                                        })
                                        .map((item) => item.seller_contact!);

                                    if (uniqueContacts.length === 0) return null;

                                    return (
                                        <div className="space-y-3 pt-2">
                                            <h4 className="font-semibold text-sm text-muted-foreground">Seller Details</h4>
                                            {uniqueContacts.map((contact) => (
                                                <ContactInfoCard
                                                    key={contact.user_id}
                                                    contact={contact}
                                                    label="Seller Contact"
                                                />
                                            ))}
                                        </div>
                                    );
                                })()}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
