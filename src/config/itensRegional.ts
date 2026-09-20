import { obterRotaTematica, Tematica, TematicaRota } from "@/types_consts/tematica";

export const posicoesItensLegislacao = [
  {
    id: 1,
    top: "20.51%",
    left: "24.84%",
  },
  {
    id: 2,
    top: "39.06%",
    left: "10.32%",
  },
  {
    id: 3,
    top: "58.74%",
    left: "19.34%",
  },
  {
    id: 4,
    top: "44.68%",
    left: "35.12%",
  },
  {
    id: 5,
    top: "79.54%",
    left: "34.44%",
  },
  {
    id: 6,
    top: "67.19%",
    left: "55.05%",
  },
  {
    id: 7,
    top: "45.17%",
    left: "60.06%",
  },
  {
    id: 8,
    top: "61.38%",
    left: "75.49%",
  },
  {
    id: 9,
    top: "75.24%",
    left: "89.32%",
  },
  {
    id: 10,
    top: "45.65%",
    left: "92.29%",
  },
  {
    id: 11,
    top: "33.25%",
    left: "80.92%",
  },
  {
    id: 12,
    top: "19.97%",
    left: "68.49%",
  },
]

export const posicoesItensTransferenciaTecnologica = [
  {
    id: 1,
    top: "50.94%",
    left: "87.99%",
  },
  {
    id: 2,
    top: "29.28%",
    left: "86.04%",
  },
  {
    id: 3,
    top: "39.61%",
    left: "75.49%",
  },
  {
    id: 4,
    top: "60.88%",
    left: "70.67%",
  },
  {
    id: 5,
    top: "50.39%",
    left: "54.82%",
  },
  {
    id: 6,
    top: "25.80%",
    left: "64.23%",
  },
  {
    id: 7,
    top: "22.93%",
    left: "49.28%",
  },
  {
    id: 8,
    top: "24.48%",
    left: "33.56%",
  },
  {
    id: 9,
    top: "24.48%",
    left: "16.86%",
  },
  {
    id: 10,
    top: "52.82%",
    left: "37.57%",
  },
  {
    id: 11,
    top: "52.60%",
    left: "24.67%",
  },
  {
    id: 12,
    top: "63.04%",
    left: "13.83%",
  },
  {
    id: 13,
    top: "89.34%",
    left: "18.33%",
  },
  {
    id: 14,
    top: "80.66%",
    left: "29.52%",
  },
  {
    id: 15,
    top: "81.16%",
    left: "46.16%",
  },
  {
    id: 16,
    top: "85.69%",
    left: "63.83%",
  },
  {
    id: 17,
    top: "83.48%",
    left: "82.29%",
  },
]

export const posicoesItensPropriedadeIntelectual = [
  {
    id: 1,
    top: "53.03%",
    left: "60.03%",
  },
  {
    id: 2,
    top: "75.49%",
    left: "53.48%",
  },
  {
    id: 3,
    top: "82.47%",
    left: "32.94%",
  },
  {
    id: 4,
    top: "76.61%",
    left: "14.10%",
  },
  {
    id: 5,
    top: "52.25%",
    left: "11.49%",
  },
  {
    id: 6,
    top: "28.03%",
    left: "14.42%",
  },
  {
    id: 7,
    top: "62.50%",
    left: "30.21%",
  },
  {
    id: 8,
    top: "38.43%",
    left: "41.21%",
  },
  {
    id: 9,
    top: "25.05%",
    left: "58.04%",
  },
  {
    id: 10,
    top: "29.79%",
    left: "79.26%",
  },
  {
    id: 11,
    top: "46.73%",
    left: "90.56%",
  },
  {
    id: 12,
    top: "70.26%",
    left: "79.95%",
  },
  {
    id: 13,
    top: "83.01%",
    left: "87.14%",
  },
]

export const posicoesItensAmbientesInovacao = [
  {
    id: 1,
    top: "70.03%",
    left: "80.77%",
  },
  {
    id: 2,
    top: "47.12%",
    left: "89.38%",
  },
  {
    id: 3,
    top: "30.07%",
    left: "79.50%",
  },
  {
    id: 4,
    top: "29.00%",
    left: "61.45%",
  },
  {
    id: 5,
    top: "39.67%",
    left: "44.57%",
  },
  {
    id: 6,
    top: "22.17%",
    left: "31.02%",
  },
  {
    id: 7,
    top: "29.19%",
    left: "16.46%",
  },
  {
    id: 8,
    top: "53.61%",
    left: "12.41%",
  },
  {
    id: 9,
    top: "78.31%",
    left: "15.15%",
  },
  {
    id: 10,
    top: "87.38%",
    left: "33.82%",
  },
  {
    id: 11,
    top: "75.73%",
    left: "55.46%",
  },
]
/** Centro de cada laço tracejado na arte do mapa principal. */
export const posicaoPorTematica: Record<TematicaRota, { id: number; top: string; left: string }> = {
  /* Documento com selo, laço de baixo à esquerda. */
  [TematicaRota.LEGISLACAO]: {
    id: 1,
    top: "73.6%",
    left: "24.8%",
  },
  /* Engrenagem com setas de ciclo, laço de cima à direita. */
  [TematicaRota.TRANFERENCIA_TECNOLOGICA]: {
    id: 2,
    top: "31.1%",
    left: "76.7%",
  },
  /* Lâmpada, laço de cima à esquerda. */
  [TematicaRota.PROPRIEDADE_INTELECTUAL]: {
    id: 3,
    top: "30.4%",
    left: "25%",
  },
  /* Pessoas em volta da lâmpada, laço de baixo à direita. */
  [TematicaRota.AMBIENTES_INOVACAO]: {
    id: 4,
    top: "73.6%",
    left: "75.8%",
  },
};
/** Posição da temática no mapa principal, pelo título. */
export function posicaoDaTematica(
  titulo: string
): { id: number; top: string; left: string } | undefined {
  const rota = obterRotaTematica(titulo);

  if (!rota) return undefined;

  return posicaoPorTematica[rota];
}

/** Cadeado no centro do mapa. */
export const posicaoTarefaFinal = {
  id: 5,
  top: "52.2%",
  left: "50.9%",
};
// ---------------------------------------------------------------
// Capacidade visual de cada trilha
// ---------------------------------------------------------------

/**
 * Posição de um item sobre a imagem do mapa, em porcentagem.
 */
export type PosicaoItemMapa = {
  id: number
  top: string
  left: string
}

export const posicoesPorTrilha: Record<TematicaRota, PosicaoItemMapa[]> = {
  [TematicaRota.LEGISLACAO]: posicoesItensLegislacao,
  [TematicaRota.TRANFERENCIA_TECNOLOGICA]: posicoesItensTransferenciaTecnologica,
  [TematicaRota.PROPRIEDADE_INTELECTUAL]: posicoesItensPropriedadeIntelectual,
  [TematicaRota.AMBIENTES_INOVACAO]: posicoesItensAmbientesInovacao,
};

/**
 * Posições da trilha informada.
 *
 * Aceita tanto o parâmetro de rota ("legislacao") quanto o título
 * gravado no banco ("legislação"), porque as telas trabalham com um ou
 * com o outro.
 */
export function posicoesDaTrilha(trilha: string): PosicaoItemMapa[] {
  const rota = obterRotaTematica(trilha);

  if (!rota) return [];

  return posicoesPorTrilha[rota] ?? [];
}

/**
 * Quantidade de missões que a imagem da trilha consegue representar.
 *
 * Devolve 0 quando a trilha não é uma das quatro mapeadas. Nesse caso
 * não existe limite conhecido, e quem chama deve tratar 0 como
 * "sem limite a aplicar" — nunca como "não cabe nenhuma missão".
 */
/**
 * Proporção largura/altura de cada imagem de mapa.
 *
 * As posições dos ícones são percentuais do CONTÊINER, não da imagem.
 * Enquanto o contêiner tinha altura fixa (minH/maxH) e a imagem usava
 * objectFit "cover", qualquer largura de tela em que a proporção do
 * contêiner divergisse da proporção da arte recortava o desenho — e
 * os ícones, ancorados em porcentagem, descolavam dos pontos do mapa.
 * Em telas estreitas o recorte passava de 40% da largura.
 *
 * Fixando o contêiner na proporção da própria arte, a porcentagem
 * volta a valer para o desenho inteiro em qualquer largura.
 */
export const proporcaoMapaPrincipal = 1568 / 1003;

export const proporcaoMapaPorTrilha: Record<TematicaRota, number> = {
  [TematicaRota.LEGISLACAO]: 1536 / 1024,
  [TematicaRota.TRANFERENCIA_TECNOLOGICA]: 1536 / 905,
  [TematicaRota.PROPRIEDADE_INTELECTUAL]: 1536 / 1024,
  [TematicaRota.AMBIENTES_INOVACAO]: 1446 / 1026,
};

export function proporcaoDaTrilha(trilha: string): number {
  const rota = obterRotaTematica(trilha);

  if (!rota) return proporcaoMapaPrincipal;

  return proporcaoMapaPorTrilha[rota] ?? proporcaoMapaPrincipal;
}

export function capacidadeDaTrilha(trilha: string): number {
  if(trilha === Tematica.TAREFA_FINAL){
    return 1
  }
  
  return posicoesDaTrilha(trilha).length;
}
