import { api } from "./axios";
import { Login, UsuarioDTO } from "../src/types_consts/usuario";

export const UsuarioAPI = {

    login(login: Login) {
        return api.post("api/v1/login", login)
    },

    listar() {
        return api.get("api/v1/usuarios");
    },

    buscarPorId(idUsauario: number) {
        return api.get(`api/v1/usuarios/${idUsauario}`);
    },

    salvar(usuario: UsuarioDTO) {
        return api.post("api/v1/usuarios", usuario);
    },

    atualizar(idUsauario: number, usuario: UsuarioDTO) {
        return api.put(`api/v1/usuarios/${idUsauario}`, usuario);
    },

    deletar(idUsauario: number) {
        return api.get(`api/v1/usuarios/${idUsauario}`);
    },

}