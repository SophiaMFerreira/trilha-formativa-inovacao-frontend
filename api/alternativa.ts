import { api } from "./axios";
import { AlternativaDTO } from "../src/types_consts/alternativa";

export const AlternativaAPI = {

    listar() {
        return api.get("api/v1/alternativas");
    },

    listarPorQuestao(idQuestao: number) {
        return api.get(`api/v1/questoes/${idQuestao}/alternativas`);
    },

    buscarPorId(idQuestao: number, idAlternativa: number) {
        return api.get(`api/v1/questoes/${idQuestao}/alternativas/${idAlternativa}`);
    },

    salvar(idQuestao: number, alternativa: AlternativaDTO) {
        return api.post(`api/v1/questoes/${idQuestao}/alternativas`, alternativa);
    },

    atualizar(idQuestao: number, idAlternativa: number, alternativa: AlternativaDTO) {
        return api.put(`api/v1/questoes/${idQuestao}/alternativas/${idAlternativa}`, alternativa);
    },

    deletar(idQuestao: number, idAlternativa: number) {
        return api.get(`api/v1/questoes/${idQuestao}/alternativas/${idAlternativa}`);
    },
}