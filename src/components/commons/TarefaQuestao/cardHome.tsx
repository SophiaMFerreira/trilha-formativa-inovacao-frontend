import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { FaPencilAlt, FaRegClock } from "react-icons/fa";
import CardCustomizado from "../cardCustomizado";
import { TipoAtividade } from "@/types_consts/missao";

type HomeMissaoProps = {
    missao: TipoAtividade
    titulo: string;
    tentativas: number;
    trilha: string;
    parametroTrilha: string;
    navigate: Function
    setEtapa: Function;
};
export default function HomeMissao({ missao, titulo, tentativas, trilha, parametroTrilha, navigate, setEtapa }: HomeMissaoProps) {

    const mensagem = missao === "quiz" ?
        `Este quiz contém 5 perguntas sobre o conteúdo de ${trilha}.` : (
            missao === "tarefa" ?
                `Esta tarefa contém 5 perguntas sobre o conteúdo de ${trilha}.` :
                `Você chegou à última missão! Mostre tudo o que aprendeu e conquiste essa última etapa! Atenção, esta tarefa possui apenas uma tentativa`
        )
    const mensagemTempo = missao === "quiz" ? "Tempo por pergunta: 5 min" : "Tempo da tarefa: 30 min"
    return (
        <CardCustomizado
            titulo={titulo}
            info={`0${String(tentativas)}/${missao !== TipoAtividade.TAREFA_FINAL ? "03" : "01"}`}
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