import { useEffect, useState } from "react";

import { Button, CloseButton, Dialog, Em, Heading, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import { FaCheck, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import CardCustomizado from "../cardCustomizado";
import { QuestaoProp } from "@/types_consts/questao";
import { shuffleArray } from "@/utils/shuffle";

import { useAuth } from "@/hooks/useAuth";
import { ConcluirAtividadeProps, concluirMissao, RetornoConclusao } from "@/utils/concluirMissao";
import { TipoAtividade } from "@/types_consts/missao";
import { AlternativaMarcadaDTO } from "@/types_consts/alternativa";
import { ResultadoQuestao } from "@/utils/calcularRespostas";
import { useGame } from "@/hooks/useGame";

type ConclusaoProps = {
    valorMissao: number
    idMissao: number
    tipoAtividade: TipoAtividade
    idDistintivo?: number
    questoes: QuestaoProp[]
    respostas: AlternativaMarcadaDTO[][]
    tentativas: number

    trilha: string
    parametroTrilha: string
    setEtapa: Function
    setQuestoes: Function
    setRespostas: Function
    setPontuacao: Function
    setIdQuestao?: Function

    navigate: Function
};
export default function ConclusaoMissao({
    valorMissao,
    idMissao,
    tipoAtividade,
    idDistintivo,
    questoes,
    respostas,
    tentativas,

    trilha,
    parametroTrilha,
    setEtapa,
    setQuestoes,
    setRespostas,
    setPontuacao,
    setIdQuestao,
    navigate
}: ConclusaoProps) {
    const [questaoSelecionada, setQuestaoSelecionada] = useState<{
        questao: QuestaoProp;
        index: number,
    } | null>(null);

    const { user } = useAuth()
    const { atualizarDistintivos, atualizarProgresso } = useGame()

    const [open, setOpen] = useState(false)
    const propsCorrecao = {
        user: user,
        valorMissao: valorMissao,
        idMissao: idMissao,
        tipoMaterial: "atividade",
        tipoAtividade: tipoAtividade,
        idDistintivo: idDistintivo,
        questoes: questoes,
        respostas: respostas,
        tentativas: tentativas
    } as ConcluirAtividadeProps

    const [retornoConclusao, setRetornoConclusao] =
        useState<RetornoConclusao>({
            pontos: 0,
            tentativas: 0,
            progresso: 0,
            corretas: [],
            parciais: [],
            incorretas: [],
        });

    useEffect(() => {
        async function corrigir() {
            try {
                const retorno = await concluirMissao(propsCorrecao)
                if (!retorno) return;

                setRetornoConclusao(retorno)
                
                atualizarProgresso()
                atualizarDistintivos()
            } catch (erro) {
                console.error(erro);
                //MENSAGEM DE ERRO
            }
        }
        corrigir()
    }, []);

    function reiniciarMissao() {
        setQuestoes(shuffleArray(questoes));
        setRespostas(
            Array.from({ length: 5 }, () => [
                {
                    idUsuario: user?.id ?? -1,
                    idAlternativa: -1,
                }
            ]));
        setPontuacao(0);

        if(tipoAtividade == TipoAtividade.QUIZ){
            setIdQuestao!(0)
        }
        setEtapa("home")
    }

    type ExibirRespostasProp = {
        grupoQuestoes: ResultadoQuestao[],
        status: "correta" | "errada" | "incompleta"
    }
    function ExibirRespostas({
        grupoQuestoes,
        status
    } : ExibirRespostasProp) {
        if (!Array.isArray(grupoQuestoes)) return
        if (grupoQuestoes.length === 0) return

        return grupoQuestoes
            .map((respostaQuestao, i) => {
                const index = questoes.findIndex(q => q.id === respostaQuestao.questao.id)
                return (
                <HStack
                    key={index}
                    justify="space-between"
                    rounded="md"
                    gap="1"
                    cursor="pointer"
                    color={
                        status === "correta"
                            ? "brand.secondary"
                            : status === "incompleta"
                                ? "orange.500"
                                : "brand.secondaryRed"
                    }

                    onClick={() => {
                        setQuestaoSelecionada({
                            questao: respostaQuestao.questao,
                            index: index,
                        });
                        setOpen(true);
                    }}
                >
                    {status === "correta" && <FaCheck size={16} />}
                    {status === "incompleta" && <FaExclamationTriangle size={16} />}
                    {status === "errada" && <FaTimes size={16} />}
                    <Text textStyle="bodyText">
                        Questão {index + 1}
                    </Text>
                </HStack>
                )});
    }

    if (!retornoConclusao) {
        //MENSAGEM DE ERRO
        return
    }

    return (
        <CardCustomizado
            titulo="Parabéns!"
            mensagem={tipoAtividade === "quiz" ? `Você concluiu o quiz sobre ${trilha} — excelente trabalho!` :
                `Você concluiu a tarefa sobre ${trilha} — excelente trabalho!`}
        >
            <Stack
                w="full"
                gap="3"
                justify="center"
            >
                <Text
                    color="brand.neutral"
                    textStyle="bodyTextBold"
                >
                    Sua pontuação:
                </Text>
                <Text
                    color="brand.primaryDark"
                    textStyle="headingSM"
                    textAlign="center"
                >
                    {retornoConclusao.pontos.toFixed(2)} pontos
                </Text>
                <HStack
                    gap="4"
                    justify="center"
                    align="flex-start"
                    w="100%"
                >
                    <Stack
                        flex="1"
                        align="center"
                    >
                        <ExibirRespostas
                            grupoQuestoes={retornoConclusao.corretas}
                            status="correta"
                        />
                    </Stack>
                    <Stack
                        flex="1"
                        align="center"
                    >
                        <ExibirRespostas
                            grupoQuestoes={retornoConclusao.parciais}
                            status="incompleta"
                        />
                    </Stack>
                    <Stack
                        flex="1"
                        align="center"
                    >
                        <ExibirRespostas
                            grupoQuestoes={retornoConclusao.incorretas}
                            status="errada"
                        />
                    </Stack>
                </HStack>
            </Stack>
            <HStack
                justify="center"
                gap="4"
                w="full"
                my="8"
                color="brand.neutral"
                textStyle="bodyTextBold"
            >
                <Button
                    flex={1}
                    w="100%"
                    variant="outline"
                    onClick={reiniciarMissao}
                    disabled={tentativas >= 3}
                >
                    Refazer {tipoAtividade === "quiz" ? "quiz" : "tarefa"}
                </Button>
                <Button
                    flex={1}
                    w="100%"
                    variant="solid"
                    type="submit"
                    onClick={() => navigate(`/trilhaFormativaInovacao/${parametroTrilha}`)}
                >
                    Próximo módulo
                </Button>
            </HStack>
            <Text
                color="brand.primaryDark"
                textStyle="inputPlaceholder"
                mt="-6"
            >
                0{String(retornoConclusao.tentativas)}/03 tentativas restantes
            </Text>

            <Dialog.Root
                lazyMount
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                placement="center"
                size="lg"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p="6">
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="md" />
                            </Dialog.CloseTrigger>
                            <Dialog.Body
                                justifyContent="center"
                            >
                                <Stack
                                    gap="2"
                                    justifyContent="center"
                                    align="center"
                                >
                                    <Heading
                                        as="h2"
                                        textStyle="headingXL"
                                        color="brand.primaryDark"
                                        mb="2"
                                    >
                                        Questão {questaoSelecionada?.index !== undefined && questaoSelecionada?.index + 1}
                                    </Heading>
                                    <Text
                                        textStyle="bodyTextLong"
                                        color="brand.neutral"
                                        textAlign="justify"
                                        w="full"
                                    >
                                        {questaoSelecionada?.questao.enunciado}
                                    </Text>
                                    <Text
                                        textStyle="bodyTextLong"
                                        color="brand.neutral"
                                        textAlign="justify"
                                        w="full"
                                    >
                                        <Em
                                            textStyle="bodyTextBold"
                                            fontStyle="normal"
                                        >
                                            Resposta:{" "}
                                        </Em>
                                        {questaoSelecionada?.questao.mensagemCorrecao}
                                    </Text>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer justifyContent="center">
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="outline"
                                        w="100%"
                                        maxW="lg"
                                    >
                                        Voltar
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </CardCustomizado >
    );
}