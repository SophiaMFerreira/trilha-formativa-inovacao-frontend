import { api } from "./axios";
import { QuestaoDTO } from "../src/types_consts/questao";

export const QuestaoAPI = {

    listar() {
        return api.get("questoes");
    },

    listarPorMissao(idMissao: number) {
        return api.get(`missoes/${idMissao}/questoes`);
    },

    buscarPorId(idMissao: number, idQuestao: number) {
        return api.get(`missoes/${idMissao}/questoes/${idQuestao}`);
    },

    salvar(idMissao: number, questao: QuestaoDTO) {
        return api.post(`missoes/${idMissao}/questoes`, questao);
    },

    atualizar(idMissao: number, idQuestao: number, questao: QuestaoDTO) {
        return api.put(`missoes/${idMissao}/questoes/${idQuestao}`, questao);
    },

    deletar(idMissao: number, idQuestao: number) {
        return api.delete(`missoes/${idMissao}/questoes/${idQuestao}`);
    }
}