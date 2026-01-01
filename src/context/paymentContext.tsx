import { createContext, useContext, useState } from "react";
import { createPayment, getAllPayments } from "../services/payment";

interface PaymentContextType {
    payments: any[];
    loading: boolean;
    makePayment: (paymentData: any) => Promise<any>;
    fetchAllPayments: () => Promise<void>;
}

export const PaymentContext = createContext<PaymentContextType | null>(null);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllPayments = async () => {
        setLoading(true);
        try {
            const res = await getAllPayments();
            if (res.message === 'Payments fetched successfully' && res.data) {
                setPayments(res.data);
            }
        } catch (error) {
            console.error("Error fetching payments", error);
        } finally {
            setLoading(false);
        }
    };

    const makePayment = async (paymentData: any) => {
        try {
            const res = await createPayment(paymentData);
            await fetchAllPayments();
            return res;
        } catch (error) {
            console.error("Error creating payment", error);
            throw error;
        }
    };

    return (
        <PaymentContext.Provider value={{ payments, loading, makePayment, fetchAllPayments }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error("usePayment must be used within a PaymentProvider");
    }
    return context;
};
