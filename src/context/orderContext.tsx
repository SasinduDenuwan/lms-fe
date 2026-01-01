import { createContext, useContext } from "react";
import { createOrder } from "../services/order";

interface OrderContextType {
    placeOrder: (orderData: any) => Promise<any>;
}

export const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {

    const placeOrder = async (orderData: any) => {
        try {
            return await createOrder(orderData);
        } catch (error) {
            console.error("Error placing order", error);
            throw error;
        }
    };

    return (
        <OrderContext.Provider value={{ placeOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder must be used within a OrderProvider");
    }
    return context;
};
