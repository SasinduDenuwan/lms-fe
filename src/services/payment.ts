import api from "./api";

export const createPayment = async (paymentData: any) => {
    const res = await api.post("/payment/create-payment", paymentData);
    return res.data;
}

export const getAllPayments = async () => {
    const res = await api.get("/payment/get-all-payment");
    return res.data;
}