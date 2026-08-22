import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, InputGroup, Stack, Heading, Flex } from "@chakra-ui/react"
import CardCustomizado from "@/components/commons/cardCustomizado";
import { AppInput } from "@/components/commons/AppInput";
import { FaSearch } from "react-icons/fa";
import { Missao, MissaoAtividade } from "@/types_consts/missao";
import { Tematica, TematicaDTO, tematicaLabel } from "@/types_consts/tematica";
import { MissaoAPI } from "../../api/missao";
import { TematicaAPI } from "../../api/tematica";
import ListagemMissaoAtividade from "@/components/listagemMissaoAtividade";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

type GrupoTematica = {
    tematica: string;
    atividades: MissaoAtividade[];
};
export default function BancoMissoesAtividade() {
    const navigate = useNavigate()

    const [missoesPorTematica, setMissoesPorTematica] = useState<GrupoTematica[]>([]);

    const [termoBusca, setTermoBusca] = useState("");
    const materiaisFiltrados = useMemo(() => {
        if (!termoBusca.trim()) {
            return missoesPorTematica;
        }

        const busca = termoBusca.toLowerCase();

        return missoesPorTematica
            .map(grupoTematica => (
                {
                    tematica: grupoTematica.tematica,
                    atividades: grupoTematica.atividades.filter(material =>
                        material.tematica.titulo.toLowerCase().includes(busca) ||
                        material.titulo.toLowerCase().includes(busca) ||
                        material.pontuacao.toString().includes(busca) ||
                        material.tipoAtividade.toLowerCase().includes(busca) ||
                        material.questoes.some(q => q.enunciado.toLowerCase().includes(busca) ||
                            q.mensagemCorrecao.toLowerCase().includes(busca)
                        )
                    )
                }))
    }, [termoBusca, missoesPorTematica]);

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
            const missoesAtividade = missoes.filter((m): m is MissaoAtividade => "tipoAtividade" in m)

            if (!missoesAtividade) return
            const missoesFiltradas = tematicas.map(tematica => {
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
                    atividades: missoesAtividade.filter(missao =>
                        missao.tematica.id === tematica.id
                    )
                }
            })
            setMissoesPorTematica(missoesFiltradas)

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
                titulo={"Banco de missões atividade"}
                mensagem={"Faça cadastro, edição e exclusão de missões atividade para a trilha formativa."}
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
                                placeholder="Pesquisar missão atividade"
                                appVariant="filled"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}

                            />
                        </InputGroup>
                        <Button
                            variant="solid"
                            onClick={() => navigate("/cadastro-missao-atividade")}
                        >
                            Adicionar missão
                        </Button>
                    </HStack>
                    <Stack>
                        {materiaisFiltrados.map(groupoTematica => (
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
                                    {groupoTematica.atividades.map(material => (
                                        <ListagemMissaoAtividade
                                            key={material.id}
                                            {...material}
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
                        onClick={() => navigate("/cadastro-missao-atividade")}
                    >
                        Adicionar missão
                    </Button>
                </Flex>
            </CardCustomizado>
    );
}