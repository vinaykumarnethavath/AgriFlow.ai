import api from './api';

// --- Payment API ---

export interface PaymentOrder {
    id: number;
    user_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    payment_for: string;
    reference_id: number | null;
    shipping_address: string | null;
    shipping_status: string | null;
    tracking_id: string | null;
    notes: string | null;
    created_at: string;
    paid_at: string | null;
}

export interface CreatePaymentRequest {
    amount: number;
    payment_for: string;
    reference_id?: number;
    shipping_address?: string;
    notes?: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface RazorpayConfig {
    key_id: string;
    is_mock?: boolean;
    is_test_mode?: boolean;
    currency?: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(true));
            existing.addEventListener("error", () => resolve(false));
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const getRazorpayConfig = async (): Promise<RazorpayConfig> => {
    try {
        const response = await api.get<RazorpayConfig>("/payments/config");
        return response.data;
    } catch (err) {
        const fallbackKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
        return {
            key_id: fallbackKey || "rzp_test_placeholder",
            is_mock: !fallbackKey || fallbackKey.startsWith("rzp_test_placeholder"),
            is_test_mode: fallbackKey.startsWith("rzp_test_"),
            currency: "INR",
        };
    }
};

export const createPaymentOrder = async (data: CreatePaymentRequest) => {
    const response = await api.post<PaymentOrder>("/payments/create-order", data);
    return response.data;
};

export const verifyPayment = async (data: VerifyPaymentRequest) => {
    const response = await api.post("/payments/verify", data);
    return response.data;
};

export const getPaymentHistory = async () => {
    const response = await api.get<PaymentOrder[]>("/payments/history");
    return response.data;
};

export const updateShippingStatus = async (
    paymentId: number,
    shippingStatus: string,
    trackingId?: string
) => {
    const params: any = { shipping_status: shippingStatus };
    if (trackingId) params.tracking_id = trackingId;
    const response = await api.put(`/payments/${paymentId}/shipping`, null, { params });
    return response.data;
};

export interface ProcessPaymentParams {
    amount: number;
    payment_for: string;
    reference_id?: number;
    shipping_address?: string;
    notes?: string;
    name?: string;
    description?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    onSuccess: (verifyResult: any) => Promise<void> | void;
    onFailure?: (error: any) => void;
    onOpenMockPopup: (options: any) => void;
}

export const executePaymentFlow = async ({
    amount,
    payment_for,
    reference_id,
    shipping_address,
    notes,
    name = "AgriFlow.AI",
    description,
    prefill,
    onSuccess,
    onFailure,
    onOpenMockPopup,
}: ProcessPaymentParams) => {
    // 1. Create order on backend
    const paymentOrder = await createPaymentOrder({
        amount,
        payment_for,
        reference_id,
        shipping_address,
        notes,
    });

    // 2. Fetch config
    const config = await getRazorpayConfig();

    const options: any = {
        key: config.key_id,
        amount: Math.round(amount * 100),
        currency: config.currency || "INR",
        name,
        description: description || `Order #${reference_id || paymentOrder.id}`,
        order_id: paymentOrder.razorpay_order_id,
        prefill: prefill || {},
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
            try {
                const verifyRes = await verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });
                await onSuccess(verifyRes);
            } catch (err: any) {
                if (onFailure) onFailure(err);
                else alert(err?.response?.data?.detail || "Payment verification failed.");
            }
        },
        modal: {
            ondismiss: () => {
                if (onFailure) onFailure(new Error("Payment cancelled by user"));
            }
        }
    };

    // If mock mode or placeholder keys, directly open interactive MockRazorpayPopup
    if (config.is_mock || !config.key_id || config.key_id.startsWith("rzp_test_placeholder")) {
        onOpenMockPopup(options);
        return;
    }

    // Try loading Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        onOpenMockPopup(options);
        return;
    }

    try {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.on("payment.failed", (resp: any) => {
            console.error("Razorpay payment failed:", resp.error);
            if (onFailure) onFailure(resp.error);
            else alert(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
        });
        razorpay.open();
    } catch (err) {
        console.warn("Failed to open Razorpay checkout, falling back to mock modal:", err);
        onOpenMockPopup(options);
    }
};
