import React, { createContext, useContext, useState } from "react";

interface PortfolioContextType {
  refreshBaskets: boolean;
  setRefreshBaskets: (refresh: boolean) => void;
  refreshTokenBalances: boolean;
  setRefreshTokenBalances: (refresh: boolean) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshBaskets, setRefreshBaskets] = useState(false);
  const [refreshTokenBalances, setRefreshTokenBalances] = useState(false);

  return (
    <PortfolioContext.Provider
      value={{ refreshBaskets, setRefreshBaskets, refreshTokenBalances, setRefreshTokenBalances }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolioContext must be used within a PortfolioProvider");
  }
  return context;
};
