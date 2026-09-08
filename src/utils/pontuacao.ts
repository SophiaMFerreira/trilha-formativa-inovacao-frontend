import { ProgressoMissao } from "@/types_consts/missao";

/**
 * Pontuação que um progresso de missão vale para o usuário.
 *
 * Regra única da aplicação:
 *  - missão de atividade (quiz/tarefa): vale a pontuação efetivamente
 *    obtida na correção;
 *  - missão de conteúdo: vale a pontuação da missão quando houve
 *    algum progresso, e zero caso contrário.
 *
 * O GameProvider e o Ranking calculavam isso separadamente e com
 * critérios diferentes — o provider olhava "pontuacaoObtida" e o
 * ranking olhava "tipoMaterial" —, então o total do usuário no ranking
 * não coincidia com o total exibido na tela. Com uma função só, os
 * dois somam a mesma coisa.
 */
export function pontuacaoDoProgresso(progresso: ProgressoMissao): number {
    if (!progresso?.missao) return 0;

    if ("pontuacaoObtida" in progresso) {
        return Number(progresso.pontuacaoObtida) || 0;
    }

    const houveProgresso = (Number(progresso.progresso) || 0) > 0;

    return houveProgresso ? Number(progresso.missao.pontuacao) || 0 : 0;
}

/**
 * Percentual sempre exibível: número finito entre 0 e 100.
 *
 * Concentra o tratamento de divisão por zero, undefined/null e dados
 * ainda não carregados, que produziam NaN e Infinity nas barras de
 * progresso.
 */
export function percentualSeguro(valor: unknown, total: unknown): number {
    const numerador = Number(valor);
    const denominador = Number(total);

    if (!Number.isFinite(numerador) || !Number.isFinite(denominador)) return 0;
    if (denominador <= 0) return 0;

    return limitarPercentual((numerador * 100) / denominador);
}

/**
 * Garante 0 <= percentual <= 100 para um valor já em escala percentual.
 *
 * NaN e Infinity viram 0, não 100: os dois só aparecem quando o
 * cálculo está quebrado ou o dado ainda não chegou, e nesse caso
 * mostrar a barra cheia afirmaria uma conclusão que não existe.
 */
export function limitarPercentual(percentual: unknown): number {
    const numero = Number(percentual);

    if (!Number.isFinite(numero)) return 0;

    return Math.min(Math.max(numero, 0), 100);
}

/** Média aritmética protegida contra lista vazia. */
export function mediaSegura(valores: number[]): number {
    if (!Array.isArray(valores) || valores.length === 0) return 0;

    const soma = valores.reduce(
        (acumulado, valor) => acumulado + (Number(valor) || 0),
        0
    );

    return soma / valores.length;
}
