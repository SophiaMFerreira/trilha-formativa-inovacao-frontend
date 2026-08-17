import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { Box, Button, HStack, Stack, Text, } from "@chakra-ui/react";
import CardCustomizado from "@/components/commons/cardCustomizado";
import HomeMissao from "@/components/commons/TarefaQuestao/cardHome";
import ConclusaoMissao from "@/components/commons/TarefaQuestao/cardConclusao";
import { QuestaoRadio, QuestaoSelect } from "@/components/commons/TarefaQuestao/multiplaEscolha";
import { QuestaoCheckbox } from "@/components/commons/TarefaQuestao/multiplaEscolhaVarias";
import { QuestaoProp } from "@/types_consts/questao";

import { shuffleArray } from "@/utils/shuffle";
import { Alternativa, AlternativaMarcadaDTO, AlternativaMultiplaEscolhaDTO, SubtipoAlternativa, TipoAlternativa } from "@/types_consts/alternativa";
import { MissaoAPI } from "../../api/missao";
import { useAuth } from "@/hooks/useAuth";
import { Missao, MissaoTarefa, ProgressoMissaoAtividade, TipoAtividade } from "@/types_consts/missao";
import { useGame } from "@/hooks/useGame";
import { obterNomeTematica } from "@/types_consts/tematica";


export default function Tarefa() {
    const navigate = useNavigate()
    const { ParamTrilha, idMissao } = useParams()
    const { user } = useAuth()
    const { progressoMissoes } = useGame()

    const [etapa, setEtapa] = useState<"home" | "tarefa" | "resultado">("home");

    const [idTarefa, setIdTarefa] = useState(-1);
    const [titulo, setTitulo] = useState("");
    const [valorMissao, setValorMissao] = useState(0);
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
    const [carregando, setCarregando] = useState(true)

    const [trilha, setTrilha] = useState("");

    const [progressoTarefa, setProgressoTarefa] = useState<ProgressoMissaoAtividade>();
    const [respostas, setRespostas] = useState<AlternativaMarcadaDTO[][]>(
        Array.from({ length: 5 }, () => [
            {
                idUsuario: user?.id ?? -1,
                idAlternativa: -1,
            }
        ])
    );

    const [pontuacao, setPontuacao] = useState(0);
    const [tentativas, setTentativas] = useState(0);

    const [exibicaoQuestoes] = useState(() =>
        questoes.map((q) => {
            if (q.alternativas[0].tipoAlternativa === TipoAlternativa.MULTIPLA_ESCOLHA) {
                const alternativa = q.alternativas[0] as AlternativaMultiplaEscolhaDTO
                return alternativa.subtipo === SubtipoAlternativa.MULTIPLAS_CORRETAS ?
                    "checkbox" :
                    Math.random() < 0.5
                        ? "radio"
                        : "select"
            } else {
                return "checkbox"
            }
        }));

    const TEMPO_TAREFA = 30 * 60
    const [tempo, setTempo] = useState(TEMPO_TAREFA)
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;

    useEffect(() => {
        async function carregarDados() {
            
            try {
                const missaoResponse = await MissaoAPI.listar()
                //const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                if (!missaoResponse.data) return; //MENSAGEM ERRO 
                
                const missoes = missaoResponse.data as Missao[]
                const missao = missoes.find(m => m.id === (Number(idMissao)))
                if (!missao) return
                
                //const missao = missaoResponse.data as Missao
                if (!("tipoAtividade" in missao)) return; //MENSAGEM ERRO

                if (missao.tipoAtividade === TipoAtividade.QUIZ) return; //MENSAGEM ERRO
                const tarefa = missao as MissaoTarefa

                if (!("questoes" in tarefa) ||
                    tarefa.questoes.length < 5) {
                    //MENSAGEM ERRO
                    navigate(`/trilhaFormativaInovacao/${ParamTrilha}`)
                    return
                }

                setIdTarefa(tarefa.id)
                setTitulo(tarefa.titulo)
                setValorMissao(tarefa.pontuacao)
                setTrilha(obterNomeTematica(tarefa.tematica.titulo))

                setQuestoes(shuffleArray(tarefa.questoes))
                setCarregando(false)

                const progresso = progressoMissoes.find(p => p.missao.id === tarefa.id)
                if (!progresso) return;

                const progressoTarefa = progresso as ProgressoMissaoAtividade

                setProgressoTarefa(progressoTarefa)
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
            setTempo((t) => Math.max(t - 1, 0));
        }, 1000);

        if (tempo === 0) {
            setEtapa("resultado");
        }

        return () => clearInterval(intervalo);
    }, []);

    if (!ParamTrilha || !idMissao) return

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (carregando) {
        return (
            <CardCustomizado
                titulo=""
                mensagem={""}
                info="--:--"
            >
                <Text>Carregando tarefa...</Text>
            </CardCustomizado>
        )
    }

    if (!questoes ||
        !questoes.map(q =>
            !("alternativas" in q) ||
            q.alternativas.length === 0 ||
            !q.alternativas
        )) {
        //MENSAGEM ERRO
        return <Navigate to={`/trilhaFormativaInovacao/${ParamTrilha}`} replace />
    }

    function alterarRespostaMultiplaEscolha(idAlternativas: string[], idQuestao: number) {
        const novasRespostas = [...respostas] as AlternativaMarcadaDTO[][]
        const novaResposta = idAlternativas.map(resposta => ({
            idUsuario: respostas[idQuestao][0].idUsuario,
            idAlternativa: Number(resposta)
        }))
        novasRespostas[idQuestao] = novaResposta
        setRespostas(novasRespostas);
    }

    return (
        < Box
            minH="calc(100vh - 88px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            px="6"
        >
            {
                etapa === "home" &&
                <HomeMissao
                    key={"home"}
                    missao="tarefa"
                    titulo={titulo}
                    tentativas={tentativas}
                    trilha={trilha}
                    parametroTrilha={ParamTrilha}
                    navigate={navigate}
                    setEtapa={setEtapa}
                />
            } {
                etapa === "tarefa" &&
                <CardCustomizado
                    key={"tarefa"}
                    titulo={titulo}
                    mensagem={`Esta tarefa contém 5 perguntas sobre o conteúdo da trilha de ${trilha}.`}
                    info={`${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`}
                >
                    <Stack
                        w="100%"
                        gap="6"
                        textStyle="bodyTextLong"
                        color="brand.neutral"
                        textAlign="justify"
                        mt="8"
                    >
                        {questoes.map((questao, index) => (
                            <FormatoQuestaoAleatorio
                                key={questao.id}
                                exibicaoQuestoes={exibicaoQuestoes}
                                questao={questao}
                                index={index}
                                respostas={respostas}
                                alterarResposta={alterarRespostaMultiplaEscolha}
                            />
                        ))}
                        <HStack
                            gap="6"
                            w="100%"
                            maxW="3xl"
                        >
                            <Button
                                flex={1}
                                w="100%"
                                variant="outline"
                                onClick={() => setEtapa("home")}
                            >
                                Voltar
                            </Button>
                            <Button
                                flex={1}
                                w="100%"
                                variant="solid"
                                type="submit"
                                onClick={() => setEtapa("resultado")}
                            >
                                Responder tarefa
                            </Button>
                        </HStack>
                    </Stack>
                </CardCustomizado>
            } {
                etapa === "resultado" &&
                <ConclusaoMissao
                    key={"resultado"}

                    valorMissao={valorMissao}
                    idMissao={idTarefa}
                    tipoAtividade={TipoAtividade.TAREFA}
                    questoes={questoes}
                    respostas={respostas}
                    tentativas={tentativas}

                    trilha={trilha}
                    parametroTrilha={ParamTrilha!}
                    setEtapa={setEtapa}
                    setQuestoes={setQuestoes}
                    setRespostas={setRespostas}
                    setPontuacao={setPontuacao}

                    navigate={navigate}
                />
            }
        </Box>
    )
}


type FormatoQuestaoAleatorioProps = {
    exibicaoQuestoes: string[];
    questao: QuestaoProp;
    index: number;
    respostas: AlternativaMarcadaDTO[][];
    alterarResposta: (idAlternativas: string[], idQuestao: number) => void;
};
export function FormatoQuestaoAleatorio({
    exibicaoQuestoes,
    questao,
    index,
    respostas,
    alterarResposta,
}: FormatoQuestaoAleatorioProps) {

    if (exibicaoQuestoes[index] === "checkbox") {
        /* return (
             <QuestaoCheckbox
                 key={questao.id}
                 questao={questao}
                 index={index}
                 value={respostas[index]}
                 onChange={alterarResposta}
             />
         )*/
    }

    if (questao.alternativas[0].tipoAlternativa === TipoAlternativa.ASSOCIACAO) {
        const [colunas, setColunas] = useState(<></>)
        // gerar colunas
    }
    if (questao.alternativas[0].tipoAlternativa === TipoAlternativa.ORDENACAO) {
        const [linhas, setLinhas] = useState(<></>)
        // gerar combinacoes
    }

    if (exibicaoQuestoes[index] === "radio") {
        return (
            <QuestaoRadio
                key={questao.id}
                questao={questao}
                index={index}
                value={String(respostas[index][0].idAlternativa) ?? ""}
                onChange={alterarResposta}
            />
        )
    } else {
        return (
            <QuestaoSelect
                key={questao.id}
                questao={questao}
                index={index}
                value={String(respostas[index][0].idAlternativa) ?? ""}
                onChange={alterarResposta}
            />
        )
    }
}