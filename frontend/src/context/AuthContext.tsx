import {
  createContext,
  useEffect,
  useState,
} from "react";

import type { Usuario } from "../types/usuario";

type AuthContextType = {
  usuario: Usuario | null;

  estaAutenticado: boolean;

  login: (usuario: Usuario) => void;

  logout: () => void;
};

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioStorage =
      localStorage.getItem("usuario");

    if (usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage));
    }
  }, []);

  function login(usuarioData: Usuario) {
    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioData),
    );

    localStorage.setItem(
      "token",
      usuarioData.token,
    );

    setUsuario(usuarioData);
  }

  function logout() {
    localStorage.removeItem("usuario");

    localStorage.removeItem("token");

    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,

        estaAutenticado: !!usuario,

        login,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}