import { createContext, useContext, useEffect, useState } from "react";
import { getCartItems, addCartItem, deleteCartItem } from "../services/cart";
import { useAuth } from "./authContext";

interface CartContextType {
  cartItems: any[];
  loading: boolean;
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
        setCartItems([]);
        return;
    }
    try {
      setLoading(true);
      const items = await getCartItems(user._id || user.id);
      setCartItems(items);
    } catch (error) {
      console.error("Failed to fetch cart items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (item: any) => {
    try {
      await addCartItem(item);
      await refreshCart();
    } catch (error) {
      console.error("Failed to add to cart", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await deleteCartItem(itemId);
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove from cart", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
