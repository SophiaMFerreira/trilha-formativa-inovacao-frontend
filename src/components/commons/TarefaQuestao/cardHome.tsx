import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { FaPencilAlt, FaRegClock } from "react-icons/fa";
import CardCustomizado from "../cardCustomizado";
import { TipoAtividade } from "@/types_consts/missao";
import { esgotouTentativas, formatarTentativas } from "@/utils/tentativas";

type HomeMissaoProps = {
    missao: TipoAtividade
    titulo: string;
    tentativas: number;
    /** Questões realmente cadastradas na missão. */
    quantidadeQuestoes: number;
    trilha: string;
    parametroTrilha: string;
    navigate: Function
    setEtapa: Function;
};
export default function HomeMissao({ missao, titulo, tentativas, quantidadeQuestoes, trilha, parametroTrilha, navigate, setEtapa }: HomeMissaoProps) {

    /*
     * A contagem de perguntas vem da missão, e não de um "5" fixo: o
     * cadastro exige um mínimo de cinco questões, mas não impõe teto,
     * e o card anunciava cinco mesmo quando havia mais.
     */
    const plural = quantidadeQuestoes === 1 ? "pergunta" : "perguntas"

    const mensagem = missao === "quiz" ?
        `Este quiz contém ${quantidadeQuestoes} ${plural} sobre o conteúdo de ${trilha}.` : (
            missao === "tarefa" ?
                `Esta tarefa contém ${quantidadeQuestoes} ${plural} sobre o conteúdo de ${trilha}.` :
                `Você chegou à última missão! Mostre tudo o que aprendeu e conquiste essa última etapa! Atenção, esta tarefa possui apenas uma tentativa`
        )
    const mensagemTempo = missao === "quiz" ? "Tempo por pergunta: 5 min" : "Tempo da tarefa: 30 min"
    return (
        <CardCustomizado
            titulo={titulo}
            info={formatarTentativas(tentativas, missao)}
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
                        <Text>Perguntas: {quantidadeQuestoes}</Text>
                    </Stack>
                    {/*
                      * O limite sai de utils/tentativas: a tarefa final
                      * vale uma tentativa, e não três como o número
                      * fixo anterior permitia.
                      */}
                    <Button
                        flex={1}
                        w="100%"
                        variant="solid"
                        type="submit"
                        disabled={esgotouTentativas(tentativas, missao)}
                        onClick={() => setEtapa(missao === "quiz" ? "quiz" : "tarefa")}
                    >
                        Começar!
                    </Button>
                </Stack>
            </HStack>
        </CardCustomizado>
    );
}