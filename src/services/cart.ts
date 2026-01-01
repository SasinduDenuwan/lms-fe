import api from "./api";

export const getCartItems = async (userId: string) => {
    const res = await api.get(`/cart/get-all-cart-items/${userId}`);
    return res.data;
}

export const addCartItem = async (cartItem: any) => {
    const res = await api.post("/cart/add-cart-item", cartItem);
    return res.data;
}   

export const deleteCartItem = async (cartItemId: string) => {
    const res = await api.delete("/cart/delete-cart-item", { data: { cartItemId } });
    return res.data;
}