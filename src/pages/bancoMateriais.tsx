import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, InputGroup, Stack, Heading, Flex } from "@chakra-ui/react"
import ListagemMaterial from "@/components/listagemMaterial";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { AppInput } from "@/components/commons/AppInput";
import { toaster, Toaster } from "@/components/commons/toaster";
import { FaSearch } from "react-icons/fa";
import { Missao, MissaoConteudo } from "@/types_consts/missao";
import { Tematica, TematicaDTO, tematicaLabel } from "@/types_consts/tematica";
import { MissaoAPI } from "../../api/missao";
import { TematicaAPI } from "../../api/tematica";
import { mensagensErroConsole } from "@/config/mensagensError";
import { mensagensToastErro } from "@/config/mensagensToaster";

type GrupoTematica = {
    tematica: string;
    materiais: MissaoConteudo[];
};
export default function BancoMateriais() {
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
                    materiais: grupoTematica.materiais.filter(material =>
                        material.tematica.titulo.toLowerCase().includes(busca) ||
                        material.pontuacao.toString().includes(busca) ||
                        material.resumo.toLowerCase().includes(busca) ||
                        material.tipoMaterial.toLowerCase().includes(busca) ||
                        material.titulo.toLowerCase().includes(busca) ||
                        material.url.toLowerCase().includes(busca)
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
                toaster.create(mensagensToastErro.carregarMissoesConteudo)
                return
            }
            const missoes = missoesResponse.data as Missao[]
            const missoesMateriais = missoes.filter((m): m is MissaoConteudo => "tipoMaterial" in m)

            if (!missoesMateriais) return
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
                    materiais: missoesMateriais.filter(missao =>
                        missao.tematica.id === tematica.id
                    )
                }
            })
            setMissoesPorTematica(missoesFiltradas)

        } catch (erro) {
            console.error(mensagensErroConsole.buscarGenerico, erro)
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <>
            <CardCustomizado
                titulo={"Banco de materiais de estudo"}
                mensagem={"Faça cadastro, edição e exclusão de materiais de estudo para a trilha formativa."}
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
                                placeholder="Pesquisar material de estudo"
                                appVariant="filled"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}

                            />
                        </InputGroup>
                        <Button
                            variant="solid"
                            onClick={() => navigate("/cadastro-materiais")}
                        >
                            Adicionar material
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
                                    {groupoTematica.materiais.map(material => (
                                        <ListagemMaterial
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
                        onClick={() => navigate("/cadastro-materiais")}
                    >
                        Adicionar material
                    </Button>
                </Flex>
            </CardCustomizado>
            <Toaster />
        </>
    );
}