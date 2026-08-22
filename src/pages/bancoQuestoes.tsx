import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, HStack, InputGroup, Stack, Heading, Flex, } from "@chakra-ui/react"
import CardCustomizado from "@/components/commons/cardCustomizado";
import ListagemQuestao from "@/components/listagemQuestao";
import { toaster } from "@/components/commons/toaster";
import { FaSearch } from "react-icons/fa";
import { Tematica, TematicaDTO, tematicaLabel } from "@/types_consts/tematica";
import { QuestaoProp } from "@/types_consts/questao";
import { SubtipoAlternativaLabel, TipoAlternativa, TipoAlternativaLabel } from "@/types_consts/alternativa";
import { Missao, MissaoAtividade } from "@/types_consts/missao";
import { TematicaAPI } from "../../api/tematica";
import { MissaoAPI } from "../../api/missao";
import { AppInput } from "@/components/commons/AppInput";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

type GrupoTematica = {
    tematica: string;
    questoes: QuestaoRich[];
}
type QuestaoRich = QuestaoProp & {
    missao: string;
}

export default function BancoQuestoes() {
    const navigate = useNavigate()

    const [questoesPorTematica, setQuestoesPorTematica] = useState<GrupoTematica[]>([]);

    const [termoBusca, setTermoBusca] = useState("");
    const questoesFiltradas = useMemo(() => {
        if (!termoBusca.trim()) {
            return questoesPorTematica;
        }

        const busca = termoBusca.toLowerCase();

        return questoesPorTematica
            .map(grupoTematica => ({

                tematica: grupoTematica.tematica,
                questoes: grupoTematica.questoes.filter(questao => {
                    if (!questao.alternativas?.length) return;

                    let tipoQuestao = "Tipo desconhecido";
                    switch (questao.alternativas[0].tipoAlternativa) {
                        case TipoAlternativa.ASSOCIACAO:
                        case TipoAlternativa.ORDENACAO:
                            tipoQuestao = TipoAlternativaLabel[questao.alternativas[0].tipoAlternativa];
                            break;

                        case TipoAlternativa.MULTIPLA_ESCOLHA:
                            tipoQuestao = SubtipoAlternativaLabel[
                                (questao.alternativas[0].subtipo as keyof typeof SubtipoAlternativaLabel)
                            ];
                            break;
                    }
                    return (
                        grupoTematica.tematica.toLowerCase().includes(busca) ||
                        questao.missao?.toLowerCase().includes(busca) ||
                        questao.enunciado.toLowerCase().includes(busca) ||
                        questao.mensagemCorrecao.toLowerCase().includes(busca) ||
                        questao.alternativas.some((alternativa) =>
                            alternativa.texto.toLowerCase().includes(busca) ||
                            alternativa.tipoAlternativa.includes(busca)
                        )
                    )
                })
            }
            ))
    }, [termoBusca, questoesPorTematica]);

    async function carregarDados() {
        try {
            const [
                tematicasResponse,
                missoesResponse,
            ] = await Promise.all([
                TematicaAPI.listar(),
                MissaoAPI.listar(),
            ]);

            if (!tematicasResponse.data) {
                toaster.create(mensagensToastErro.carregarTematicas)
                return
            }
            const tematicas = tematicasResponse.data as TematicaDTO[]

            if (!missoesResponse.data) {
                toaster.create(mensagensToastErro.carregarMissoesAtividade)
                return
            }
            const missoes = missoesResponse.data as Missao[]
            const missoesAtividades = missoes.filter((m): m is MissaoAtividade => "tipoAtividade" in m)

            if (!missoesAtividades) return
            const missoesFiltradas: GrupoTematica[] = tematicas.map(tematica => {
                let t = tematica.titulo;

                switch (t) {
                    case Tematica.LEGISLACAO:
                    case Tematica.AMBIENTES_INOVACAO:
                    case Tematica.PROPRIEDADE_INTELECTUAL:
                    case Tematica.TRANFERENCIA_TECNOLOGICA:
                        t = tematicaLabel[t];
                        break;
                }

                return {
                    tematica: t as string,
                    questoes: missoesAtividades
                        .filter(missao => missao.tematica.id === tematica.id)
                        .flatMap(missao =>
                            missao.questoes.map(questao => ({
                                ...questao,
                                missao: missao.titulo,
                            }))
                        )
                };
            });

            setQuestoesPorTematica(missoesFiltradas)
        } catch (erro) {
            console.error(mensagensErroConsole.buscarGenerico, erro)
            toaster.create(mensagensToastErro.carregarGenerico)
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <CardCustomizado
            titulo={"Banco de questões"}
            mensagem={"Faça cadastro, edição e exclusão de questões para a trilha formativa."}
        >
            <Flex
                direction="column"
                justify="center"
                gap="3"
                mt={6}
            >
                <HStack
                    justify="space-between"
                    flex="1"
                >
                    <InputGroup
                        endElement={
                            <Box color="brand.primaryDark">
                                <FaSearch />
                            </Box>
                        }
                        maxW="md"
                    >
                        <AppInput
                            placeholder="Pesquisar questão"
                            appVariant="filled"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                    </InputGroup>
                    <Button
                        variant="solid"
                        onClick={() => navigate("/cadastro-questoes")}
                    >
                        Adcionar questão
                    </Button>
                </HStack>
                <Stack>
                    {questoesFiltradas.map(groupoTematica => (
                        <Box
                            my={3}
                            key={groupoTematica.tematica}
                        >
                            <Heading
                                textStyle="headingMD"
                                color="brand.primaryDark"
                                mb={1.5}
                            >
                                {groupoTematica.tematica}
                            </Heading>
                            <Stack
                                gap={2}
                            >
                                {groupoTematica.questoes.map(questao => (
                                    <ListagemQuestao
                                        key={questao.id}
                                        {...questao}
                                        onExcluir={carregarDados}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
                <Button
                    variant="outline"
                    w="sm"
                    alignSelf="center"
                    onClick={() => navigate("/cadastro-questoes")}
                >
                    Adcionar questão
                </Button>
            </Flex>
        </CardCustomizado>
    );
}