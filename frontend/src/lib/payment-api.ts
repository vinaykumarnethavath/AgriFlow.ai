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
