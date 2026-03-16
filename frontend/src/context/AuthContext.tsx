import React, { createContext, useContext } from "react";

export const AuthContext = createContext({});

export const AuthProvider: React.FC = ({ children }) => (
  <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
);

export const useAuthContext = () => useContext(AuthContext);
