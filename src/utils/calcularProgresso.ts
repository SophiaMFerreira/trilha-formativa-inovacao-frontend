export function calcularProgresso(
  valorAtividade: number,
  pontuacao: number
) {
  const taxaAcerto = ( pontuacao * 100 ) / valorAtividade;

  return taxaAcerto >= 60 ? 100 : 0
}