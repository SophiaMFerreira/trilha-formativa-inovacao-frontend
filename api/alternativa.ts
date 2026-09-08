import { api } from "./axios";
import { AlternativaDTO, RetornoSalvarAlternativa } from "../src/types_consts/alternativa";

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

    /**
     * Responde 201 com as alternativas criadas em `alternativas`, já
     * com os IDs gerados — inclusive o da alternativa associada, no
     * caso do tipo Associação.
     */
    salvar(idQuestao: number, alternativa: AlternativaDTO) {
        return api.post<RetornoSalvarAlternativa>(
            `api/v1/questoes/${idQuestao}/alternativas`,
            alternativa
        );
    },

    atualizar(idQuestao: number, idAlternativa: number, alternativa: AlternativaDTO) {
        return api.put(`api/v1/questoes/${idQuestao}/alternativas/${idAlternativa}`, alternativa);
    },

    deletar(idQuestao: number, idAlternativa: number) {
        /* Estava usando api.get: a exclusão nunca chegava ao backend. */
        return api.delete(`api/v1/questoes/${idQuestao}/alternativas/${idAlternativa}`);
    },
}
