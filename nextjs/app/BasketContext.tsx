import { createContext, useContext, useState } from "react";

interface BasketContextType {
  refreshBaskets: boolean;
  setRefreshBaskets: (refresh: boolean) => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshBaskets, setRefreshBaskets] = useState(false);

  return <BasketContext.Provider value={{ refreshBaskets, setRefreshBaskets }}>{children}</BasketContext.Provider>;
};

export const useBasketContext = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasketContext must be used within a BasketProvider");
  }
  return context;
};
