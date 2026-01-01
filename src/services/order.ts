import api from "./api";

export const createOrder = async (orderData: any) => {
    const res = await api.post("/order/create-order", orderData);
    return res.data;
}