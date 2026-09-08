/**
 * Progresso de uma atividade a partir da pontuação obtida.
 *
 * A regra do sistema é binária: 60% de acerto conclui a atividade.
 *
 * A divisão era feita sem checar o divisor — uma atividade com
 * pontuação zerada, ou com o valor ainda não carregado, produzia NaN
 * (ou Infinity) e o progresso salvo ficava inválido.
 */
export function calcularProgresso(
  valorAtividade: number,
  pontuacao: number
): number {
  const valor = Number(valorAtividade);
  const pontos = Number(pontuacao);

  if (!Number.isFinite(valor) || valor <= 0) return 0;
  if (!Number.isFinite(pontos) || pontos <= 0) return 0;

  const taxaAcerto = (pontos * 100) / valor;

  return taxaAcerto >= 60 ? 100 : 0;
}
