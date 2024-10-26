import React, { createContext, useContext, useState } from "react";


interface PorfolioContextType {
  refreshBaskets: boolean;
  setRefreshBaskets: (refresh: boolean) => void;
  refreshTokenBalances: boolean;
  setRefreshTokenBalances: (refresh: boolean) => void;
}

const PorfolioContext = createContext<PorfolioContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshBaskets, setRefreshBaskets] = useState(false);
  const [refreshTokenBalances, setRefreshTokenBalances] = useState(false);

  return (
    <PorfolioContext.Provider
      value={{ refreshBaskets, setRefreshBaskets, refreshTokenBalances, setRefreshTokenBalances }}
    >
      {children}
    </PorfolioContext.Provider>
  );
};

export const usePorfolioContext = () => {
  const context = useContext(PorfolioContext);
  if (!context) {
    throw new Error("usePorfolioContext must be used within a BasketProvider");
  }
  return context;
};