import { api } from "./axios";
import { MissaoDTO } from "../src/types_consts/missao";

export const MissaoAPI = {

    listar() {
        return api.get("api/v1/missoes");
    },

    buscarPorId(idMissao: number) {
        return api.get(`api/v1/missoes/${idMissao}`);
    },

    salvar(missao: MissaoDTO) {
        return api.post("api/v1/missoes", missao);
    },

    atualizar(idMissao: number, missao: MissaoDTO) {
        return api.put(`api/v1/missoes/${idMissao}`, missao);
    },

    deletar(idMissao: number) {
        return api.delete(`api/v1/missoes/${idMissao}`);
    }
}