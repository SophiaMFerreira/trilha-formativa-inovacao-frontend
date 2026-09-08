import { capacidadeDaTrilha } from "@/config/itensRegional";
import { Missao } from "@/types_consts/missao";

export type SituacaoCapacidadeTrilha = {
    /** Posições que a imagem da trilha oferece. 0 = limite desconhecido. */
    capacidade: number
    /** Missões já cadastradas na trilha. */
    ocupadas: number
    /** Posições ainda livres. */
    disponiveis: number
    /** Verdadeiro quando não cabe mais nenhuma missão. */
    atingiuLimite: boolean
    /** Existe limite conhecido para esta trilha. */
    possuiLimite: boolean
}

/**
 * Compara quantas missões a trilha já tem com quantas posições a
 * imagem do mapa oferece.
 *
 * Cada missão ocupa uma posição fixa no mapa da trilha
 * (config/itensRegional). Cadastrar mais missões do que posições
 * deixava missões sem lugar no mapa — e a leitura do índice
 * inexistente derrubava a tela secundária.
 *
 * Trilha fora das quatro mapeadas devolve `possuiLimite: false`: não
 * há limite conhecido a aplicar, e nesse caso o cadastro NÃO deve ser
 * bloqueado.
 *
 * @param idMissaoEmEdicao Missão sendo editada; ela já ocupa uma
 * posição e por isso não conta contra o limite.
 */
export function avaliarCapacidadeDaTrilha(
    missoes: Missao[] | null | undefined,
    tituloTrilha: string,
    idMissaoEmEdicao?: number
): SituacaoCapacidadeTrilha {
    const capacidade = capacidadeDaTrilha(tituloTrilha);

    const ocupadas = (missoes ?? []).filter(missao => {
        if (missao?.tematica?.titulo !== tituloTrilha) return false;

        if (idMissaoEmEdicao !== undefined && missao.id === idMissaoEmEdicao) {
            return false;
        }

        return true;
    }).length;

    const possuiLimite = capacidade > 0;
    const disponiveis = possuiLimite ? Math.max(capacidade - ocupadas, 0) : 0;

    return {
        capacidade,
        ocupadas,
        disponiveis,
        possuiLimite,
        atingiuLimite: possuiLimite && ocupadas >= capacidade,
    };
}
