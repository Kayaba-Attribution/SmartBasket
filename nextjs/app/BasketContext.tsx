import React, { createContext, useContext, useState } from "react";

interface BasketContextType {
  refreshBaskets: boolean;
  setRefreshBaskets: (refresh: boolean) => void;
  refreshTokenBalances: boolean;
  setRefreshTokenBalances: (refresh: boolean) => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshBaskets, setRefreshBaskets] = useState(false);
  const [refreshTokenBalances, setRefreshTokenBalances] = useState(false);

  return (
    <BasketContext.Provider
      value={{ refreshBaskets, setRefreshBaskets, refreshTokenBalances, setRefreshTokenBalances }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasketContext = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasketContext must be used within a BasketProvider");
  }
  return context;
};