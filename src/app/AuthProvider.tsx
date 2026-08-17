import { ReactNode, useEffect, useMemo, useState } from "react";
import { AuthContext, User } from "@/contexts/AuthContext";
import { UsuarioAPI } from "../../api/usuario";
import { Login } from "@/types_consts/usuario";

type Props = {
    children: ReactNode;
}
export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(() => {
        const salvo = localStorage.getItem("user");
        return salvo ? JSON.parse(salvo) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });
    const autenticado = !!user && !!token

    async function login(login: string, senha: string) {
        try {
            const response = await UsuarioAPI.login({ 
                email: login, 
                senha: senha } as Login)

            if (!response.data) {
                return null
            }
            const loginResponse = response.data
            const usuarioLogado: User = {
                id: loginResponse.idUsuario,
                nomeAventureiro: loginResponse.nomeAventureiro,
                role: loginResponse.admin ? "admin" : "usuario"
            }

            setUser(usuarioLogado)
            setToken(loginResponse.token)

            localStorage.setItem("user", JSON.stringify(usuarioLogado))
            localStorage.setItem("token", loginResponse.token)



            return usuarioLogado;
        } catch (e){
            console.error(e)
            return null
        }
    }

        function logout() {
            setUser(null)
            setToken(null)

            localStorage.removeItem("user")
            localStorage.removeItem("token")
        }

        const updateUser = (novoUser: User) => {
            setUser(novoUser)
            localStorage.setItem("user", JSON.stringify(novoUser))
        }

        useEffect(() => {
            const usuarioStrorage = localStorage.getItem("user")
            const tokenStrorage = localStorage.getItem("token")

            if (!usuarioStrorage || !tokenStrorage) {
                return
            }

            setUser(JSON.parse(usuarioStrorage))
            setToken(tokenStrorage)
        }, [])

        const value = useMemo(() => ({
            user,
            token,
            autenticado,
            login,
            logout,
            updateUser
        }), [user, token])

        return (
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        );
    }