import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { FaPencilAlt, FaRegClock } from "react-icons/fa";
import CardCustomizado from "../cardCustomizado";

type HomeMissaoProps = {
    missao: "quiz" | "tarefa"
    titulo: string;
    tentativas: number;
    trilha: string;
    parametroTrilha: string;
    navigate: Function
    setEtapa: Function;
};
export default function HomeMissao({ missao, titulo, tentativas, trilha, parametroTrilha, navigate, setEtapa }: HomeMissaoProps) {    

    const mensagem = missao ? `Este quiz contém 5 perguntas sobre o conteúdo de ${trilha}.` :
                            `Esta tarefa contém 5 perguntas sobre o conteúdo de ${trilha}.`
    const mensagemTempo = missao ? "Tempo por pergunta: 5 min" : "Tempo da tarefa: 30 min"
    return (
        <CardCustomizado
            titulo={titulo}
            info={`0${String(tentativas)}/03`}
            mensagem={mensagem}
        >
            <HStack
                justify="center"
                gap="4"
                w="full"
                my="8"
                color="brand.neutral"
                textStyle="bodyTextBold"
            >
                <Stack
                    align="center"
                    gap="8"
                    w="full"
                >
                    <Stack
                        gap="2"
                        align="center"
                    >
                        <FaRegClock size={46} />
                        <Text>{mensagemTempo}</Text>
                    </Stack>
                    <Button
                        flex={1}
                        w="100%"
                        variant="outline"
                        onClick={() => navigate(`/trilhaFormativaInovacao/${parametroTrilha}`)}
                    >
                        Voltar para a trilha
                    </Button>
                </Stack>
                <Stack
                    align="center"
                    gap="8"
                    w="full"
                >
                    <Stack
                        gap="2"
                        align="center"
                    >
                        <FaPencilAlt size={46} />
                        <Text>Perguntas: 5</Text>
                    </Stack>
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        disabled={tentativas >= 3}
                        onClick={() => setEtapa(missao === "quiz" ? "quiz" : "tarefa")}
                    >
                        Começar!
                    </Button>
                </Stack>
            </HStack>
        </CardCustomizado>
    );
}