import { api } from "./axios";
import { AlternativaDTO } from "../src/types_consts/alternativa";

export const AlternativaAPI = {

    listar() {
        return api.get("alternativas");
    },

    listarPorQuestao(idQuestao: number) {
        return api.get(`questoes/${idQuestao}/alternativas`);
    },

    buscarPorId(idQuestao: number, idAlternativa: number) {
        return api.get(`questoes/${idQuestao}/alternativas/${idAlternativa}`);
    },

    salvar(idQuestao: number, alternativa: AlternativaDTO) {
        return api.post(`questoes/${idQuestao}/alternativas`, alternativa);
    },

    atualizar(idQuestao: number, idAlternativa: number, alternativa: AlternativaDTO) {
        return api.put(`questoes/${idQuestao}/alternativas/${idAlternativa}`, alternativa);
    },

    deletar(idQuestao: number, idAlternativa: number) {
        return api.get(`questoes/${idQuestao}/alternativas/${idAlternativa}`);
    },
}