import { api } from "./axios";
import { QuestaoDTO, RetornoSalvarQuestao } from "../src/types_consts/questao";

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

    /**
     * Responde 201 com o ID da questão criada em `id` (e a questão
     * completa em `questao`). Esse ID é a fonte oficial para salvar as
     * alternativas em seguida — não é preciso relistar as questões.
     */
    salvar(idMissao: number, questao: QuestaoDTO) {
        return api.post<RetornoSalvarQuestao>(
            `api/v1/missoes/${idMissao}/questoes`,
            questao
        );
    },

    atualizar(idMissao: number, idQuestao: number, questao: QuestaoDTO) {
        return api.put(`api/v1/missoes/${idMissao}/questoes/${idQuestao}`, questao);
    },

    deletar(idMissao: number, idQuestao: number) {
        return api.delete(`api/v1/missoes/${idMissao}/questoes/${idQuestao}`);
    }
}
