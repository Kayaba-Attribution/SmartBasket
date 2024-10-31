import React, { createContext, useContext, useState } from "react";

interface PortfolioContextType {
  refreshPortfolios: boolean;
  setRefreshPortfolios: (refresh: boolean) => void;
  refreshTokenBalances: boolean;
  setRefreshTokenBalances: (refresh: boolean) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshPortfolios, setRefreshPortfolios] = useState(false);
  const [refreshTokenBalances, setRefreshTokenBalances] = useState(false);

  return (
    <PortfolioContext.Provider
      value={{
        refreshPortfolios,
        setRefreshPortfolios,
        refreshTokenBalances,
        setRefreshTokenBalances
      }}
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