import { api, BASE_URL_API } from "./axios";
import { Login, UsuarioDTO } from "../src/types_consts/usuario";

export const UsuarioAPI = {

    login(login: Login) {
        return api.post("api/v1/login", login)
    },

    /**
     * Monta a URL do arquivo estático da foto. Não faz requisição:
     * quem consome deve entregar a URL ao <img>/Avatar.
     *
     * Para partir do usuário (tratando ausência de foto), use
     * urlDaFotoDePerfil em src/utils/fotoPerfil.ts.
     */
    buscarImagemPerfil(idUsauario: number, usuario: string, imagemPerfil: string) {
        return `${BASE_URL_API}image/upload/perfil/${String(idUsauario)}_${usuario}/${imagemPerfil}`
    },

    salvarImagemPerfil(idUsauario: number, imagemPerfil: FormData) {
        return api.post(`api/v1/usuarios/${idUsauario}/foto`, imagemPerfil);
    },

    /**
     * Remove a imagem de perfil: apaga o arquivo no servidor e limpa a
     * referência no banco, devolvendo fotoPerfil nulo.
     */
    removerImagemPerfil(idUsuario: number) {
        return api.delete<{ mensagem: string; fotoPerfil: null }>(
            `api/v1/usuarios/${idUsuario}/foto`
        );
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
        /* Estava usando api.get: a exclusão nunca chegava ao backend. */
        return api.delete(`api/v1/usuarios/${idUsauario}`);
    },

}