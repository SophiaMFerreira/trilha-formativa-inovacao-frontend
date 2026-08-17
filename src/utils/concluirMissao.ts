import { QuestaoProp } from "@/types_consts/questao";
import { AlternativaMarcadaAPI } from "../../api/alternativaMarcada";
import { corrigirRespostas, ResultadoQuestao } from "./calcularRespostas";
import { calcularProgresso } from "./calcularProgresso";
import { AlternativaMarcadaDTO } from "@/types_consts/alternativa";
import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { ProgressoMissao, ProgressoMissaoAtividade, ProgressoMissaoDTO, TipoAtividade } from "@/types_consts/missao";
import { DistintivoAdquiridoAPI } from "../../api/distintivoAdquirido";
import { DistintivoAdquiridoDTO } from "@/types_consts/distintivo";
import { User } from "@/contexts/AuthContext";

export type RetornoConclusao = {
  pontos: number
  tentativas: number
  progresso: number
  corretas: ResultadoQuestao[]
  parciais: ResultadoQuestao[]
  incorretas: ResultadoQuestao[]
}

type BaseProps = {
  user: User
  valorMissao: number
  idMissao: number
};

type ConcluirConteudoProps = BaseProps & {
  tipoMaterial: "conteudo";
};

export type ConcluirAtividadeProps = BaseProps & {
  tipoMaterial: "atividade"
  tipoAtividade: TipoAtividade
  idDistintivo: number
  questoes: QuestaoProp[]
  respostas: AlternativaMarcadaDTO[][]
  tentativas: number
};

export type ConcluirMissaoProps =
  | ConcluirConteudoProps
  | ConcluirAtividadeProps

export async function concluirMissao(props: ConcluirMissaoProps) {
  if (!props.user.id) {
    throw new Error("Usuário não autenticado.");
  }

  let progresso = 0
  let pontuacao = 0
  let progressoMissao = {}
  let corretas = [] as ResultadoQuestao[]
  let parciais = [] as ResultadoQuestao[]
  let incorretas = [] as ResultadoQuestao[]

  if (props.tipoMaterial === "conteudo") {
    progresso = 100
    pontuacao = props.valorMissao

    progressoMissao = {
      progresso: progresso,
    }

  } else {
    const respostasValidas = props.respostas
      .flat()
      .filter(resposta => resposta.idAlternativa !== -1);

    await Promise.all(
      respostasValidas.map(resposta =>
        AlternativaMarcadaAPI.salvar(resposta)
      ))

    const resultado = await corrigirRespostas(
      props.valorMissao,
      props.questoes,
      props.user.id
    )

    progresso = calcularProgresso(
      props.valorMissao,
      resultado.pontos
    )
    pontuacao = resultado.pontos
    corretas = resultado.corretas
    parciais = resultado.parciais
    incorretas = resultado.incorretas

    progressoMissao = {
      progresso: progresso,
      tentativasRealizadas: props.tentativas + 1,
      pontuacaoObtida: pontuacao
    }
  }
  try {

    if (props.tipoMaterial === "conteudo") {
      const melhorDesempenho = await verificarDesempenho(
        100, 0, props.user.id, props.idMissao, "conteudo")

      progressoMissao = {
        progresso: 100,
      }

      if (melhorDesempenho) {
        await ProgressoMissaoAPI.atualizar(
          props.user.id,
          props.idMissao,
          progressoMissao as ProgressoMissaoDTO
        );
      }
    } else {
      if (props.tipoAtividade === "tarefa" &&
        progresso === 100 && props.tentativas === 0) {
        console.log(3.1)
        await DistintivoAdquiridoAPI.salvar({
          idUsuario: props.user.id,
          idDistintivo: props.idDistintivo
        } as DistintivoAdquiridoDTO)
        console.log(3.2)
      }

      const melhorDesempenho = await verificarDesempenho(
        progresso,
        pontuacao,
        props.user.id,
        props.idMissao,
        "atividade")

      if (props.tentativas < 3 && melhorDesempenho) {
        await ProgressoMissaoAPI.atualizar(
          props.user.id,
          props.idMissao,
          progressoMissao as ProgressoMissaoDTO
        );
      }
    }

  } catch (e) {
    //MENSAGEM DE ERRO
    console.error(e)
  }

  return {
    pontos: pontuacao,
    tentativas:
      props.tipoMaterial === "conteudo"
        ? 0
        : props.tentativas + 1,
    progresso,
    corretas,
    parciais,
    incorretas,
  } satisfies RetornoConclusao;
}

async function verificarDesempenho(
  progresso: number,
  pontuacao: number,
  idUsuario: number,
  idMissao: number,
  tipoMaterial: "conteudo" | "atividade"
) {

  try {
    const progressoAnteriorResponse = await ProgressoMissaoAPI.buscarPorId(idUsuario, idMissao);
    if (!progressoAnteriorResponse.data) return //MENSAGEMDE ERRO

    if (tipoMaterial === "conteudo") {
      const progressoAnterior = progressoAnteriorResponse.data as ProgressoMissao;

      return (progressoAnterior.progresso === 0 && progresso === 100) ? true : false
    } else {
      const progressoAnterior = progressoAnteriorResponse.data as ProgressoMissaoAtividade;

      return (progressoAnterior.progresso < progresso
        || progressoAnterior.pontuacaoObtida < pontuacao) ? true : false

    }
  } catch (e) {
    //MENSAGEM DE ERRO
    console.error(e)
  }
}