import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AppContext = createContext();

const readJsonStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getCartStorageKey = (userData) => {
  if (!userData) {
    return 'cart_guest';
  }
  return `cart_user_${userData.id || userData.email || userData.name || 'unknown'}`;
};

export const AppProvider = ({ children }) => {
  const initialUser = readJsonStorage('authUser', null);
  const [cart, setCart] = useState(() => readJsonStorage(getCartStorageKey(initialUser), []));
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  // Cart operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Auth operations
  const login = (userData, authToken) => {
    const currentCartKey = getCartStorageKey(user);
    localStorage.setItem(currentCartKey, JSON.stringify(cart));

    const nextCartKey = getCartStorageKey(userData);
    const nextCart = readJsonStorage(nextCartKey, []);

    setUser(userData);
    setToken(authToken || null);
    setCart(nextCart);
  };

  const logout = () => {
    const currentCartKey = getCartStorageKey(user);
    localStorage.setItem(currentCartKey, JSON.stringify(cart));

    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem(getCartStorageKey(null));
  };

  useEffect(() => {
    localStorage.setItem(getCartStorageKey(user), JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
