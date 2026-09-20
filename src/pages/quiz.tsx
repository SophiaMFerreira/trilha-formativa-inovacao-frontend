import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { Box, Button, Stack, Text } from "@chakra-ui/react";
import ConclusaoMissao from "@/components/commons/TarefaQuestao/cardConclusao";
import HomeMissao from "@/components/commons/TarefaQuestao/cardHome";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { MultiplaEscolhaVarias } from "@/components/commons/TarefaQuestao/multiplaEscolhaVarias";
import { MultiplaEscolha } from "@/components/commons/TarefaQuestao/multiplaEscolha";
import Associacao, { colunasAssociadas } from "@/components/commons/TarefaQuestao/associacao";
import Ordenacao from "@/components/commons/TarefaQuestao/ordenacao";

import { shuffleArray } from "@/utils/shuffle";
import { Missao, MissaoQuiz, ProgressoMissaoAtividade, TipoAtividade } from "@/types_consts/missao";
import { QuestaoProp } from "@/types_consts/questao";
import { Alternativa, AlternativaMarcadaDTO, SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";

import { MissaoAPI } from "../../api/missao";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { obterNomeTematica } from "@/types_consts/tematica";
import { User } from "@/contexts/AuthContext";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import { MINIMO_QUESTOES_POR_MISSAO } from "@/utils/limiteDeQuestoes";
import {
    chaveTempoQuiz,
    gravarTempoQuiz,
    lerTempoQuiz,
    limparTempoQuiz,
} from "@/utils/tempoQuiz";

export default function Quiz() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { progressoMissoes } = useGame()
    const { ParamTrilha, idMissao } = useParams()

    const [etapa, setEtapa] = useState<"home" | "quiz" | "resultado">("home")

    const [idQuiz, setIdQuiz] = useState(-1)
    const [titulo, setTitulo] = useState("")
    const [valorMissao, setValorMissao] = useState(0)
    const [questoes, setQuestoes] = useState<QuestaoProp[]>(
        Array(MINIMO_QUESTOES_POR_MISSAO).fill({
            id: -1,
            enunciado: "",
            mensagemCorrecao: "",
            idMissao: Number(idMissao),
            alternativas: Array(2).fill({
                id: -1,
                texto: "",
                tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                correta: false,
                subtipo: SubtipoAlternativa.MULTIPLA_ESCOLHA
            } as Alternativa)
        } as QuestaoProp)
    )
    const [trilha, setTrilha] = useState("")

    const [idQuestao, setIdQuestao] = useState(0)
    const questao = questoes[idQuestao]
    const [carregando, setCarregando] = useState(true)

    const [progressoQuiz, setProgressoQuiz] = useState<ProgressoMissaoAtividade>()

    const [respostas, setRespostas] = useState<AlternativaMarcadaDTO[][]>(
        Array.from({ length: MINIMO_QUESTOES_POR_MISSAO }, () => [
            {
                idUsuario: user?.id ?? -1,
                idAlternativa: -1,
            }
        ])
    );

    const [pontuacao, setPontuacao] = useState(0)
    const [tentativas, setTentativas] = useState(0)

    const TEMPO_POR_QUESTAO = 5 * 60

    /*
     * A chave do cronômetro é por aventureiro e por missão: dois
     * quizzes abertos na mesma sessão não disputam o mesmo registro.
     */
    const chaveTempo = useMemo(
        () => chaveTempoQuiz(user?.id, idMissao),
        [user?.id, idMissao]
    );

    const [tempo, setTempo] = useState<number[]>(
        Array(MINIMO_QUESTOES_POR_MISSAO).fill(TEMPO_POR_QUESTAO)
    );

    /*
     * O relógio só passa a contar depois que a missão carregou e o
     * tempo salvo foi restaurado. Sem essa trava o intervalo
     * descontava segundos do array provisório e a restauração
     * sobrescrevia a contagem logo em seguida.
     */
    const [tempoRestaurado, setTempoRestaurado] = useState(false)

    const restanteDaQuestao = tempo[idQuestao] ?? TEMPO_POR_QUESTAO
    const minutos = Math.floor(restanteDaQuestao / 60)
    const segundos = restanteDaQuestao % 60

    useEffect(() => {
        async function carregarDados() {
            try {
                const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                if (!missaoResponse.data) {
                    toaster.create(mensagensToastErro.carregarMissaoAtividade)
                    return
                }

                const missao = missaoResponse.data as Missao
                if (!("tipoAtividade" in missao)) {
                    console.error(mensagensErroConsole.tipoMissaoInvalido);
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`);
                    return
                }

                if (missao.tipoAtividade !== TipoAtividade.QUIZ) {
                    console.error(mensagensErroConsole.tipoMissaoInvalido);
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`);
                    return
                }
                const quiz = missao as MissaoQuiz

                if (!("questoes" in quiz) ||
                    quiz.questoes.length < MINIMO_QUESTOES_POR_MISSAO) {
                    toaster.create(mensagensToastErro.nenhumaQuestao);
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`)
                    return
                }

                setIdQuiz(quiz.id)
                setTitulo(quiz.titulo)
                setValorMissao(quiz.pontuacao)
                setTrilha(obterNomeTematica(quiz.tematica.titulo))

                const questoesDoQuiz = shuffleArray(quiz.questoes) as QuestaoProp[]

                setQuestoes(questoesDoQuiz)

                /*
                 * As três estruturas paralelas (questões, respostas e
                 * cronômetro) passam a ter o tamanho real da missão.
                 * Estavam fixas em cinco: uma missão com seis questões
                 * lia respostas[5] indefinido e derrubava a tela.
                 */
                setRespostas(
                    Array.from({ length: questoesDoQuiz.length }, () => [
                        {
                            idUsuario: user?.id ?? -1,
                            idAlternativa: -1,
                        }
                    ])
                )

                const tempoSalvo = lerTempoQuiz(
                    chaveTempo,
                    questoesDoQuiz.length,
                    TEMPO_POR_QUESTAO
                )

                setTempo(tempoSalvo.restante)
                setIdQuestao(tempoSalvo.idQuestao)
                setTempoRestaurado(true)

                setCarregando(false);

                const progresso = progressoMissoes.find(p => p.missao.id === quiz.id)
                if (!progresso) return;

                const progressoQuiz = progresso as ProgressoMissaoAtividade

                setProgressoQuiz(progressoQuiz)
                setTentativas(progressoQuiz.tentativasRealizadas)

            } catch (erro) {
                toaster.create(mensagensToastErro.carregarMissaoAtividade)
                console.error(mensagensErroConsole.buscarMissaoAtividade, erro);
            }
        }

        carregarDados();
    }, [ParamTrilha, idMissao]);

    useEffect(() => {
        if (!tempoRestaurado) return;

        const intervalo = setInterval(() => {
            setTempo((anterior) => {
                const copia = [...anterior];

                if (copia[idQuestao] > 0) {
                    copia[idQuestao]--;
                }

                return copia;
            });
        }, 1000);

        return () => clearInterval(intervalo);
    }, [idQuestao, tempoRestaurado]);

    /*
     * Cada segundo descontado é gravado junto com a questão atual.
     * É o que faz o cronômetro sobreviver à troca de página: ao
     * voltar, a tela retoma exatamente de onde parou.
     */
    useEffect(() => {
        if (!tempoRestaurado) return;

        gravarTempoQuiz(chaveTempo, { restante: tempo, idQuestao });
    }, [chaveTempo, tempo, idQuestao, tempoRestaurado]);

    useEffect(() => {
        if (!tempoRestaurado) return;

        if (tempo[idQuestao] === 0) {
            proximaQuestao();
        }
    }, [tempo, idQuestao, tempoRestaurado]);

    /*
     * Nova tentativa começa com o cronômetro cheio. A conclusão já
     * apaga o registro salvo; aqui o estado em memória também volta ao
     * início, senão o quiz reabriria com o tempo zerado da tentativa
     * anterior.
     */
    function reiniciarCronometro() {
        limparTempoQuiz(chaveTempo)
        setTempo(Array(questoes.length).fill(TEMPO_POR_QUESTAO))
    }

    function voltarQuestao() {
        if (idQuestao === 0) {
            setEtapa("home")
        } else {
            setIdQuestao(idQuestao - 1)
        }
    }
    function proximaQuestao() {
        if (idQuestao >= questoes.length - 1) {
            /*
             * Tentativa encerrada: o cronômetro salvo não vale mais.
             * Mantê-lo faria a próxima tentativa começar com o tempo
             * zerado da anterior.
             */
            limparTempoQuiz(chaveTempo)
            setEtapa("resultado")
        } else {
            setIdQuestao(idQuestao + 1)
        }
    }

    if (!ParamTrilha || !idMissao) return

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (carregando) {
        return (
            <CardCustomizado
                titulo="Pergunta"
                mensagem={""}
                info="00:00"
            >
                <Text>Carregando questao...</Text>
            </CardCustomizado>
        )
    }

    if (!questao.alternativas ||
        questao.alternativas.length === 0 ||
        !("alternativas" in questao)
    ) {
        toaster.create(mensagensToastErro.nenhumaQuestao);
        console.error(mensagensErroConsole.buscarMissaoAtividade);
        return <Navigate to={`/trilhaFormativaInovacao/${ParamTrilha}`} replace />
    }

    if (!questao) {
        return (
            <CardCustomizado
                titulo="Pergunta"
                mensagem={""}
                info="00:00"
            >
                <Text>Carregando questao...</Text>
            </CardCustomizado>
        )
    }

    return (
        <Box
            h="calc(100vh - 88px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            px="4"
        >
            {
                etapa === "home" &&
                <HomeMissao
                    key={"home"}
                    missao={TipoAtividade.QUIZ}
                    titulo={titulo}
                    tentativas={tentativas}
                    quantidadeQuestoes={questoes.length}
                    trilha={trilha}
                    parametroTrilha={ParamTrilha!}
                    navigate={navigate}
                    setEtapa={setEtapa}
                />
            }{
                etapa === "quiz" &&
                <CardCustomizado
                    key={"quiz"}
                    titulo={`Pergunta ${idQuestao + 1}`}
                    mensagem={""}
                    info={`${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`}
                >
                    <Stack gap="5">
                        <Text
                            color="brand.neutral"
                            textStyle="emphasis"
                        >
                            {questao.enunciado}
                        </Text>
                        <ExibirQuestao
                            questao={questao}
                            idQuestao={idQuestao}
                            respostas={respostas}
                            setRespostas={setRespostas}
                            user={user}
                        />
                    </Stack>
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="100%"
                        gap="4"
                        mt="6"
                    >
                        <Button
                            flex={1}
                            w="100%"
                            variant="outline"
                            onClick={() => voltarQuestao()}
                            disabled={idQuestao === 0}
                        >
                            Voltar
                        </Button>
                        <Button
                            flex={1}
                            w="100%"
                            variant="solid"
                            onClick={() => proximaQuestao()}
                        >
                            {idQuestao >= questoes.length - 1
                                ? "Concluir quiz"
                                : "Próxima pergunta"}
                        </Button>
                    </Stack>

                </CardCustomizado>
            }{
                etapa === "resultado" &&
                <ConclusaoMissao
                    key={"resultado"}
                    valorMissao={valorMissao}
                    idMissao={idQuiz}
                    tipoAtividade={TipoAtividade.QUIZ}
                    questoes={questoes}
                    respostas={respostas}
                    tentativas={tentativas}
                    progressoAtual={progressoQuiz!}

                    trilha={trilha}
                    parametroTrilha={ParamTrilha!}
                    setEtapa={(proxima: "home" | "quiz" | "resultado") => {
                        if (proxima === "home") reiniciarCronometro()
                        setEtapa(proxima)
                    }}
                    setQuestoes={setQuestoes}
                    setRespostas={setRespostas}
                    setPontuacao={setPontuacao}
                    setIdQuestao={setIdQuestao}
                    setTentativas={setTentativas}

                    navigate={navigate}
                />
            }
        </Box>
    )
}

type ExibirQuestaoProps = {
    questao: QuestaoProp
    idQuestao: number
    respostas: AlternativaMarcadaDTO[][]
    setRespostas: (respostas: AlternativaMarcadaDTO[][]) => void
    user: User
}

function ExibirQuestao({
    questao,
    idQuestao,
    respostas,
    setRespostas,
    user
}: ExibirQuestaoProps) {
    function alterarRespostaMultiplaEscolha(idAlternativa: string) {
        const novasRespostas = [...respostas] as AlternativaMarcadaDTO[][]
        const novaResposta = {
            idUsuario: respostas[idQuestao][0].idUsuario,
            idAlternativa: Number(idAlternativa)
        }
        novasRespostas[idQuestao] = [novaResposta]
        setRespostas(novasRespostas);
    }

    function alterarRespostaMultiplaEscolhaVarias(idAlternativas: string[]) {
        const novasRespostas = [...respostas] as AlternativaMarcadaDTO[][]
        const novaResposta = idAlternativas.map(resposta => ({
            idUsuario: respostas[idQuestao][0].idUsuario,
            idAlternativa: Number(resposta)
        }))
        novasRespostas[idQuestao] = novaResposta
        setRespostas(novasRespostas);
    }

    function alterarRespostaOrdenacao(idAlternativas: number[]) {
        const novasRespostas = [...respostas];

        const idUsuario = respostas[idQuestao]?.[0]?.idUsuario ?? user!.id;

        novasRespostas[idQuestao] = idAlternativas.map((idAlternativa, i) => ({
            idUsuario,
            idAlternativa,
            sequenciaRespondida: i + 1
        }));

        setRespostas(novasRespostas);
    }

    function alterarRespostaAssociacao(alternativasAssociadasresposta: colunasAssociadas) {
        const novasRespostas = [...respostas];
        const idUsuario = respostas[idQuestao]?.[0]?.idUsuario ?? user!.id;

        /*
         * O par é posicional: a linha i da coluna A responde a linha i
         * da coluna B. Linhas sem par são descartadas em vez de
         * derrubarem a tela ao ler `.id` de um índice inexistente.
         */
        novasRespostas[idQuestao] = alternativasAssociadasresposta.colunaA
            .flatMap((alternativaA, i) => {
                const associada = alternativasAssociadasresposta.colunaB[i];

                if (!associada) return [];

                return [{
                    idUsuario,
                    idAlternativa: alternativaA.id,
                    idAlternativaAssociadaRespondida: associada.id
                }];
            })

        setRespostas(novasRespostas);
    }

    switch (questao.alternativas[0].tipoAlternativa) {

        case TipoAlternativa.MULTIPLA_ESCOLHA:
            if (questao.alternativas[0].subtipo === SubtipoAlternativa.MULTIPLAS_CORRETAS) {
                const respostasString = respostas[idQuestao].map(r => String(r.idAlternativa))
                return (
                    <MultiplaEscolhaVarias
                        key={questao.id}
                        questao={questao}
                        value={respostasString ?? []}
                        //value={String(respostas[idQuestao]) ?? ["", ""]}
                        onChange={alterarRespostaMultiplaEscolhaVarias}
                    />)
            } else {
                return (
                    <MultiplaEscolha
                        key={questao.id}
                        questao={questao}
                        value={String(respostas[idQuestao][0].idAlternativa) ?? ""}
                        onChange={alterarRespostaMultiplaEscolha}
                        index={idQuestao}
                    />)
            }

        case TipoAlternativa.ASSOCIACAO:
            return (
                <Associacao
                    key={questao.id}
                    questao={questao}
                    value={respostas[idQuestao]}
                    onChange={alterarRespostaAssociacao}
                />
            )
        case TipoAlternativa.ORDENACAO:
            return (
                <Ordenacao
                    key={questao.id}
                    questao={questao}
                    value={respostas[idQuestao]}
                    onChange={alterarRespostaOrdenacao}
                />
            )
        default:
            return (
                <Text
                    textAlign="justify"
                    color="brand.secondaryRed"
                    textStyle="bodyText"
                >
                    Tipo de questão desconhecido.
                </Text>
            )
    }
}