import { createContext } from "react";

export type User = {
    id: number;
    nomeAventureiro: string;
    role: "admin" | "usuario";
}

export type AuthContextType = {
    user: User | null;
    token: string | null;
    autenticado: boolean;
    login: (login: string, senha: string) => Promise<User | null>;
    logout: () => void;
    updateUser: (novoUser: User) => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)