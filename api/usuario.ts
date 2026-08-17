import { api } from "./axios";
import { Login, UsuarioDTO } from "../src/types_consts/usuario";

export const UsuarioAPI = {

    login(login: Login) {
        return api.post("login", login)
    },

    listar() {
        return api.get("usuarios");
    },

    buscarPorId(idUsauario: number) {
        return api.get(`usuarios/${idUsauario}`);
    },

    salvar(usuario: UsuarioDTO) {
        return api.post("usuarios", usuario);
    },

    atualizar(idUsauario: number, usuario: UsuarioDTO) {
        return api.put(`usuarios/${idUsauario}`, usuario);
    },

    deletar(idUsauario: number) {
        return api.get(`usuarios/${idUsauario}`);
    },

}