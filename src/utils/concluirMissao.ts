import { QuestaoProp } from "@/types_consts/questao";
import { AlternativaMarcadaAPI } from "../../api/alternativaMarcada";
import { corrigirRespostas, ResultadoQuestao } from "./calcularRespostas";
import { calcularProgresso } from "./calcularProgresso";
import { AlternativaMarcada, AlternativaMarcadaDTO } from "@/types_consts/alternativa";
import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { ProgressoMissao, ProgressoMissaoAtividade, ProgressoMissaoDTO, TipoAtividade } from "@/types_consts/missao";
import { DistintivoAdquiridoAPI } from "../../api/distintivoAdquirido";
import { DistintivoAdquiridoDTO, DistintivoDTO } from "@/types_consts/distintivo";
import { User } from "@/contexts/AuthContext";
import { toaster } from "@/components/commons/toaster";
import { mensagemToasterConquista, mensagensToastErro, toasterDaApiOuPadrao } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import { mensagemDeErroDaApi } from "./erroApi";
import { esgotouTentativas } from "./tentativas";

export type RetornoConclusao = {
  pontos: number
  tentativas: number
  progresso: number
  corretas: ResultadoQuestao[]
  parciais: ResultadoQuestao[]
  incorretas: ResultadoQuestao[]
  /** Distintivo conquistado agora, se houve conquista nesta conclusão. */
  distintivoConquistado?: DistintivoDTO
}

type BaseProps = {
  user: User
  valorMissao: number
  idMissao: number
  progressoAtual: ProgressoMissao
};

type ConcluirConteudoProps = BaseProps & {
  tipoMaterial: "conteudo";
};

export type ConcluirAtividadeProps = BaseProps & {
  tipoMaterial: "atividade"
  tipoAtividade: TipoAtividade
  /** Distintivo vinculado à missão do tipo tarefa. */
  distintivo?: DistintivoDTO
  /** Distintivos que o usuário já possui, para não conceder de novo. */
  distintivosAdquiridos?: number[]
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
  let distintivoConquistado: DistintivoDTO | undefined

  if (props.tipoMaterial === "conteudo") {
    progresso = 100
    pontuacao = props.valorMissao

    progressoMissao = {
      progresso: progresso,
    } as ProgressoMissao

  } else {
    const respostasValidas = props.respostas
      .flat()
      .filter(resposta => resposta.idAlternativa !== -1);

    await registrarRespostasDaTentativa(
      props.user.id,
      props.questoes,
      respostasValidas
    )

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
        100, 0, props.progressoAtual, "conteudo")

      progressoMissao = {
        progresso: 100,
      }

      if (melhorDesempenho) {
        await ProgressoMissaoAPI.atualizar(
          props.user.id,
          props.idMissao,
          progressoMissao as ProgressoMissaoDTO
        );
        toaster.create(mensagemToasterConquista(pontuacao))
      }
    } else {
      const melhorDesempenho = await verificarDesempenho(
        progresso,
        pontuacao,
        props.progressoAtual,
        "atividade")

      if (!esgotouTentativas(props.tentativas, props.tipoAtividade)) {
        if (!melhorDesempenho) {
          const progressoAntigo = props.progressoAtual as ProgressoMissaoAtividade
          progressoMissao = {
            progresso: progressoAntigo?.progresso ?? 0,
            tentativasRealizadas: props.tentativas + 1,
            pontuacaoObtida: progressoAntigo?.pontuacaoObtida ?? 0
          } as ProgressoMissao
        }
        await ProgressoMissaoAPI.atualizar(
          props.user.id,
          props.idMissao,
          progressoMissao as ProgressoMissaoDTO
        );

        const progressoPersistido = (progressoMissao as ProgressoMissaoAtividade).progresso

        distintivoConquistado = await concederDistintivoDaTarefa(
          props,
          progressoPersistido
        )
        toaster.create(
          mensagemToasterConquista(pontuacao, distintivoConquistado?.titulo)
        )
      }
    }

  } catch (e) {
    console.error(mensagensErroConsole.salvarConsumoConteudo, e)
    toaster.create(
      toasterDaApiOuPadrao(e, mensagensToastErro.falhaAoEnviarRespostas)
    )
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
    distintivoConquistado,
  } satisfies RetornoConclusao;
}

/**
 * Concede o distintivo da missão do tipo tarefa quando o progresso
 * persistido chega a 100%.
 *
 * Regras da demanda, na ordem:
 *
 *  1. só vale para missão do tipo tarefa;
 *  2. a verificação roda depois de o progresso ter sido gravado;
 *  3. o distintivo tem de ser o vinculado à missão;
 *  4. um distintivo já adquirido não é concedido outra vez;
 *  5. o nome do distintivo volta para o toaster.
 *
 * O bloco original estava comentado e exigia `tentativas === 0`, o que
 * excluía justamente quem só alcança 100% em uma segunda tentativa.
 *
 * @returns O distintivo conquistado agora, ou undefined.
 */
async function concederDistintivoDaTarefa(
  props: ConcluirAtividadeProps,
  progressoPersistido: number
): Promise<DistintivoDTO | undefined> {
  const ehTarefa =
    props.tipoAtividade === TipoAtividade.TAREFA ||
    String(props.tipoAtividade).startsWith("tarefa")

  if (!ehTarefa) return undefined
  if (progressoPersistido !== 100) return undefined

  const distintivo = props.distintivo

  if (!distintivo?.id) return undefined

  /* Já possui: nada a conceder, e nada a anunciar. */
  if (props.distintivosAdquiridos?.includes(distintivo.id)) return undefined

  try {
    const resposta = await DistintivoAdquiridoAPI.salvar({
      idUsuario: props.user.id,
      idDistintivo: distintivo.id,
    } as DistintivoAdquiridoDTO)

    const concedido = (resposta.data as { concedido?: boolean } | undefined)?.concedido

    return concedido === false ? undefined : distintivo
  } catch (e) {
    console.error(
      mensagensErroConsole.salvarDistintivo,
      mensagemDeErroDaApi(e) ?? e
    )

    return undefined
  }
}
/**
 * Registra as respostas da tentativa atual como a resposta vigente do
 * usuário para aquelas questões.
 */
async function registrarRespostasDaTentativa(
  idUsuario: number,
  questoes: QuestaoProp[],
  respostas: AlternativaMarcadaDTO[]
): Promise<void> {
  const idsAlternativasDaAtividade = new Set(
    questoes.flatMap(questao =>
      (questao.alternativas ?? []).map(alternativa => alternativa.id)
    )
  );

  const idsRespondidos = new Set(
    respostas.map(resposta => resposta.idAlternativa)
  );

  const marcacoesResponse =
    await AlternativaMarcadaAPI.listarPorUsuario(idUsuario);

  const marcacoes = Array.isArray(marcacoesResponse.data)
    ? marcacoesResponse.data as AlternativaMarcada[]
    : [];

  const marcacoesObsoletas = marcacoes.filter(marcacao => {
    const idAlternativa = marcacao?.alternativa?.id;

    if (idAlternativa === undefined) return false;

    return idsAlternativasDaAtividade.has(idAlternativa)
      && !idsRespondidos.has(idAlternativa);
  });

  await Promise.all(
    marcacoesObsoletas.map(marcacao =>
      AlternativaMarcadaAPI.deletar(idUsuario, marcacao.alternativa.id)
    )
  );

  await Promise.all(
    respostas.map(resposta => AlternativaMarcadaAPI.salvar(resposta))
  );
}

async function verificarDesempenho(
  progresso: number,
  pontuacao: number,
  progressoAtual: ProgressoMissao,
  tipoMaterial: "conteudo" | "atividade"
) {
  try {
    if (tipoMaterial === "conteudo") {
      return (progressoAtual.progresso === 0 && progresso === 100) ? true : false
    } else {
      const progressoAtualAtividade = progressoAtual as ProgressoMissaoAtividade
      return (progressoAtualAtividade.progresso < progresso
        || progressoAtualAtividade.pontuacaoObtida < pontuacao) ? true : false

    }
  } catch (e) {
    //MENSAGEM DE ERRO
    console.error(e)
  }
}