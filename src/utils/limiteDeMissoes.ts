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
