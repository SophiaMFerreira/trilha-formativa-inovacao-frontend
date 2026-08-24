import { api } from "./axios";
import { QuestaoDTO } from "../src/types_consts/questao";

export const QuestaoAPI = {

    listar() {
        return api.get("api/v1/questoes");
    },

    listarPorMissao(idMissao: number) {
        return api.get(`api/v1/missoes/${idMissao}/questoes`);
    },

    buscarPorId(idMissao: number, idQuestao: number) {
        return api.get(`api/v1/missoes/${idMissao}/questoes/${idQuestao}`);
    },

    salvar(idMissao: number, questao: QuestaoDTO) {
        return api.post(`api/v1/missoes/${idMissao}/questoes`, questao);
    },

    atualizar(idMissao: number, idQuestao: number, questao: QuestaoDTO) {
        return api.put(`api/v1/missoes/${idMissao}/questoes/${idQuestao}`, questao);
    },

    deletar(idMissao: number, idQuestao: number) {
        return api.delete(`api/v1/missoes/${idMissao}/questoes/${idQuestao}`);
    }
}