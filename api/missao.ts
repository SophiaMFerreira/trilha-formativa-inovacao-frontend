import { api } from "./axios";
import { MissaoDTO } from "../src/types_consts/missao";

export const MissaoAPI = {

    listar() {
        return api.get("missoes");
    },

    buscarPorId(idMissao: number) {
        return api.get(`missoes/${idMissao}`);
    },

    salvar(missao: MissaoDTO) {
        return api.post("missoes", missao);
    },

    atualizar(idMissao: number, missao: MissaoDTO) {
        return api.put(`missoes/${idMissao}`, missao);
    },

    deletar(idMissao: number) {
        return api.delete(`missoes/${idMissao}`);
    }
}