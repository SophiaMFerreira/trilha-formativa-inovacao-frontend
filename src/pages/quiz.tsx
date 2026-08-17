import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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
        Array(5).fill({
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
        Array.from({ length: 5 }, () => [
            {
                idUsuario: user?.id ?? -1,
                idAlternativa: -1,
            }
        ])
    );

    const [pontuacao, setPontuacao] = useState(0)
    const [tentativas, setTentativas] = useState(0)

    const TEMPO_POR_QUESTAO = 5 * 60
    const [tempo, setTempo] = useState(
        Array(5).fill(TEMPO_POR_QUESTAO)
    );
    const minutos = Math.floor(tempo[idQuestao] / 60)
    const segundos = tempo[idQuestao] % 60

    useEffect(() => {
        async function carregarDados() {
            try {
                const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                if (!missaoResponse.data) return; //MENSAGEM ERRO 

                const missao = missaoResponse.data as Missao
                if (!("tipoAtividade" in missao)) return; //MENSAGEM ERRO

                if (missao.tipoAtividade !== TipoAtividade.QUIZ) return; //MENSAGEM ERRO
                const quiz = missao as MissaoQuiz

                if (!("questoes" in quiz) ||
                    quiz.questoes.length < 5) {
                    //MENSAGEM ERRO
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`)
                    return
                }

                setIdQuiz(quiz.id)
                setTitulo(quiz.titulo)
                setValorMissao(quiz.pontuacao)
                setTrilha(obterNomeTematica(quiz.tematica.titulo))

                setQuestoes(shuffleArray(quiz.questoes) as QuestaoProp[])
                setCarregando(false);

                const progresso = progressoMissoes.find(p => p.missao.id === quiz.id)
                if (!progresso) return;

                const progressoTarefa = progresso as ProgressoMissaoAtividade

                setProgressoQuiz(progressoTarefa)
                setTentativas(progressoTarefa.tentativasRealizadas)

            } catch (erro) {
                console.error(erro);
                //MENSAGEM DE ERRO
            }
        }

        carregarDados();
    }, [ParamTrilha, idMissao]);

    useEffect(() => {
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
    }, [idQuestao]);

    useEffect(() => {
        if (tempo[idQuestao] === 0) {
            proximaQuestao();
        }
    }, [tempo, idQuestao]);

    function voltarQuestao() {
        if (idQuestao === 0) {
            setEtapa("home")
        } else {
            setIdQuestao(idQuestao - 1)
        }
    }
    function proximaQuestao() {
        if (idQuestao === 4) {
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
                info="--:--"
            >
                <Text>Carregando questao...</Text>
            </CardCustomizado>
        )
    }

    if (!questao.alternativas ||
        questao.alternativas.length === 0 ||
        !("alternativas" in questao)
    ) {
        //MENSAGEM ERRO
        return <Navigate to={`/trilhaFormativaInovacao/${ParamTrilha}`} replace />
    }

    if (!questao) {
        return (
            <CardCustomizado
                titulo="Pergunta"
                mensagem={""}
                info="05:00"
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
                    missao="quiz"
                    titulo={titulo}
                    tentativas={tentativas}
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
                            {questao.enunciado || "enunciado"}
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
                        >
                            Voltar
                        </Button>
                        <Button
                            flex={1}
                            w="100%"
                            variant="solid"
                            onClick={() => proximaQuestao()}
                        >
                            {idQuestao === 4 ? "Concluir quiz" : "Próxima pergunta"}
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

                    trilha={trilha}
                    parametroTrilha={ParamTrilha!}
                    setEtapa={setEtapa}
                    setQuestoes={setQuestoes}
                    setRespostas={setRespostas}
                    setPontuacao={setPontuacao}
                    setIdQuestao={setIdQuestao}

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

    /*
    function alterarRespostaAssociacao(indice: number, resposta: colunasAssociadas) {
        setRespostas((anterior) => {
            const novo = [...anterior];
            novo[indice] = resposta.colunaA.map((alternativa, i) => {
                return {
                    idUsuario: user!.id,
                    idAlternativa: Number(resposta.colunaA[i].id),
                    idAlternativaAssociadaRespondida: Number(resposta.colunaB[i].id)
                }
            })
            return novo;
        });
    }
    

    

    function alterarRespostaAssociacao(alternativas: colunasAssociadas) {
        const aAssociadas = alternativas.colunaA.flatMap((alternativa, i) => [
            {
                id: alternativa.id,
                texto: alternativa.texto,
                tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                alternativaAssociada: {
                    id: alternativas.colunaB[i].id,
                    texto: alternativas.colunaB[i].tipoAlternativa,
                    tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                }
            }, {
                id: alternativas.colunaB[i].id,
                texto: alternativas.colunaB[i].texto,
                tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                alternativaAssociada: {
                    id: alternativa.id,
                    texto: alternativa.texto,
                    tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                }
            }
        ]) as unknown
        const alternativaAssociacao = aAssociadas as AlternativaAssociacao[]
        setAlternativas(alternativaAssociacao)
    }

    
        */

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
            {/*
                            <Associacao
                            key={questao.id}
                                questao={questao}
                                //value={respostas[iQuestao]}
                                onChange={(valor) => alterarRespostaAssociacao(idQuestao, valor)}
                            />
                        */}
        case TipoAlternativa.ORDENACAO:
            const respostasIds = respostas[idQuestao].map(r => {
                r.idAlternativa !== -1
                return r.idAlternativa
            })
            return (
                <Ordenacao
                    key={questao.id}
                    questao={questao}
                    //value={respostasIds ?? []}
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