import { QuestaoProp } from "@/types_consts/questao";

/**
 * Quantidade mínima de questões que uma missão de atividade precisa
 * ter para poder ser jogada.
 *
 * As telas de quiz, tarefa e tarefa final percorrem as cinco
 * primeiras questões da missão. Uma missão publicada com menos do que
 * isso é recusada em tempo de execução ("Nenhuma questão encontrada")
 * e o aventureiro é devolvido para a trilha sem entender o motivo.
 * Por isso o número aparece no cadastro, e não só no jogo.
 */
export const MINIMO_QUESTOES_POR_MISSAO = 5;

export type SituacaoQuestoesDaMissao = {
    /** Questões já vinculadas à missão. */
    quantidade: number
    /** Piso exigido para a missão ficar jogável. */
    minimo: number
    /** Quantas ainda faltam para atingir o piso. */
    faltam: number
    /** Verdadeiro quando a missão já tem questões suficientes. */
    atingiuMinimo: boolean
};

/**
 * Compara quantas questões a missão já tem com o mínimo exigido.
 *
 * Diferentemente do limite de posições do mapa
 * (utils/limiteDeMissoes), aqui NÃO existe teto: a missão pode ter
 * quantas questões o administrador quiser. O que existe é um piso, e
 * é ele que precisa ficar visível durante o cadastro.
 */
export function avaliarQuestoesDaMissao(
    questoes: QuestaoProp[] | null | undefined,
    minimo: number = MINIMO_QUESTOES_POR_MISSAO
): SituacaoQuestoesDaMissao {
    const quantidade = questoes?.length ?? 0;

    return {
        quantidade,
        minimo,
        faltam: Math.max(minimo - quantidade, 0),
        atingiuMinimo: quantidade >= minimo,
    };
}
