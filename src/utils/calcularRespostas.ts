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
  const valorQuestao = valorAtividade / questoes.length

  //const alternativasResponse = await AlternativaMarcadaAPI.listarPorUsuario(userId);
  const alternativasResponse = await AlternativaMarcadaAPI.listar();
  if (!alternativasResponse.data) return {
    pontos: 0,
    corretas: [],
    parciais: [],
    incorretas: [],
  };
  const alt = alternativasResponse.data as AlternativaMarcada[]
  const altUsuario = alt.filter(ar => ar.usuario.id === userId)

 // const alternativas = alternativasResponse.data as AlternativaMarcada[];

  /*const idsAlternativasQuestao = new Set(questoes.flatMap(q =>
    q.alternativas.map(a => a.id!)
  ));*/

  const idsAlternativasQuestao = new Set(
    questoes.map(q => q.id)
  );

  const respostasDaMissao = altUsuario.filter(a =>
    idsAlternativasQuestao.has(a.alternativa.idQuestao)
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
      valorAlternativa = valorQuestao / questao.alternativas.filter(
        alternativa => alternativa.correta
      ).length
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