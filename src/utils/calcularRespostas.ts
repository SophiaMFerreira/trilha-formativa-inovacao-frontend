import { QuestaoProp } from "@/types_consts/questao";
import { AlternativaMarcadaAPI } from "../../api/alternativaMarcada";
import { AlternativaMarcada, SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";

export type ResultadoQuestao = {
  questao: QuestaoProp;
  alternativas: AlternativaMarcada[];
}

type ResultadoCorrecao = {
  pontos: number;
  corretas: ResultadoQuestao[];
  parciais: ResultadoQuestao[];
  incorretas: ResultadoQuestao[];
}

export async function corrigirRespostas(
  valorAtividade: number,
  questoes: QuestaoProp[],
  userId: number,
): Promise<ResultadoCorrecao> {
  const resultadoVazio: ResultadoCorrecao = {
    pontos: 0,
    corretas: [],
    parciais: [],
    incorretas: [],
  };

  /* Sem questões não há o que corrigir — e a divisão abaixo daria NaN. */
  if (!Array.isArray(questoes) || questoes.length === 0) {
    return resultadoVazio;
  }

  const valorQuestao = valorAtividade / questoes.length

  /*
   * Somente as marcações DESTE usuário.
   *
   * A versão anterior chamava listar(), que traz as marcações de todos
   * os usuários da plataforma, e filtrava no navegador. O custo cresce
   * com a base inteira a cada correção de quiz.
   */
  const alternativasResponse =
    await AlternativaMarcadaAPI.listarPorUsuario(userId);

  if (!Array.isArray(alternativasResponse.data)) return resultadoVazio;

  const marcacoesDoUsuario = alternativasResponse.data as AlternativaMarcada[]

  const idsQuestoesDaMissao = new Set(
    questoes.map(q => q.id)
  );

  const respostasDaMissao = marcacoesDoUsuario.filter(a =>
    a?.alternativa && idsQuestoesDaMissao.has(a.alternativa.idQuestao)
  );

  const respostasPorQuestao =
    new Map<number, AlternativaMarcada[]>();

  respostasDaMissao.forEach(resposta => {
    const idQuestao =
      resposta.alternativa.idQuestao;

    if (!respostasPorQuestao.has(idQuestao)) {
      respostasPorQuestao.set(idQuestao, []);
    }

    respostasPorQuestao
      .get(idQuestao)!
      .push(resposta);
  });

  const corretas: ResultadoQuestao[] = [];
  const parciais: ResultadoQuestao[] = [];
  const incorretas: ResultadoQuestao[] = [];
  let pontos = 0;

  questoes.forEach(questao => {
    const respostas =
      respostasPorQuestao.get(questao.id) ?? [];

    /*
     * Questão sem alternativas cadastradas: contabiliza como não
     * respondida em vez de estourar em alternativas[0].
     */
    if (!questao.alternativas?.length) {
      incorretas.push({ questao, alternativas: respostas });
      return;
    }

    if (respostas.length === 0) {
      incorretas.push({
        questao,
        alternativas: [],
      });
      return;
    }

    let valorAlternativa = valorQuestao

    if ("subtipo" in questao.alternativas[0] &&
      questao.alternativas[0].subtipo === SubtipoAlternativa.MULTIPLAS_CORRETAS) {
      const quantidadeCorretas = questao.alternativas.filter(
        alternativa => alternativa.correta
      ).length

      /* Sem gabarito não há divisor: a questão não pontua. */
      valorAlternativa = quantidadeCorretas > 0
        ? valorQuestao / quantidadeCorretas
        : 0
    }
    if (questao.alternativas[0].tipoAlternativa !== TipoAlternativa.MULTIPLA_ESCOLHA) {
      valorAlternativa = valorQuestao / questao.alternativas.length
    }

    const acertos =
      respostas.filter(
        resposta => resposta.correta).length;

    const pontosQuestao = valorAlternativa * acertos;
    pontos += pontosQuestao;

    if (acertos === respostas.length) {
      corretas.push({
        questao,
        alternativas: respostas,
      });
    }
    if (acertos === 0) {
      incorretas.push({
        questao,
        alternativas: respostas,
      });
    }
    if (acertos > 0 && acertos < respostas.length) {
      parciais.push({
        questao,
        alternativas: respostas,
      });
    }
  });
  
  return {
    pontos,
    corretas,
    parciais,
    incorretas,
  };
}