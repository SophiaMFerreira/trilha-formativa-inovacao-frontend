import { api } from "./axios";
import { ProgressoMissaoDTO } from "@/types_consts/missao";

export const ProgressoMissaoAPI = {

    listar() {
        return api.get("api/v1/progresso-missao");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/missoes`);
    },

    buscarPorId(idUsuario: number, idMissao: number) {
        return api.get(`api/v1/usuarios/${idUsuario}/missoes/${idMissao}`);
    },

    salvar( progressoMissao: ProgressoMissaoDTO) {
        return api.post("api/v1/usuarios/missoes", progressoMissao);
    },

    atualizar(idUsuario: number, idMissao: number, progressoMissao: ProgressoMissaoDTO ) {
        return api.put(`api/v1/usuarios/${idUsuario}/missoes/${idMissao}`, progressoMissao);
    },

    deletar(idUsuario: number, idMissao: number) {
        return api.delete(`api/v1/usuarios/${idUsuario}/missoes/${idMissao}`);
    }
}