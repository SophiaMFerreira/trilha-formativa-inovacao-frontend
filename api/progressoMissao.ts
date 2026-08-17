import { api } from "./axios";
import { ProgressoMissaoDTO } from "@/types_consts/missao";

export const ProgressoMissaoAPI = {

    listar() {
        return api.get("progresso-missao");
    },

    listarPorUsuario(idUsuario: number) {
        return api.get(`usuarios/${idUsuario}/missoes`);
    },

    buscarPorId(idUsuario: number, idMissao: number) {
        return api.get(`usuarios/${idUsuario}/missoes/${idMissao}`);
    },

    salvar( progressoMissao: ProgressoMissaoDTO) {
        return api.post("usuarios/missoes", progressoMissao);
    },

    atualizar(idUsuario: number, idMissao: number, progressoMissao: ProgressoMissaoDTO ) {
        return api.put(`usuarios/${idUsuario}/missoes/${idMissao}`, progressoMissao);
    },

    deletar(idUsuario: number, idMissao: number) {
        return api.delete(`usuarios/${idUsuario}/missoes/${idMissao}`);
    }
}