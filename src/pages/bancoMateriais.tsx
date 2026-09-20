import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, InputGroup, Stack, Heading, Flex } from "@chakra-ui/react";
import ListagemMaterial from "@/components/listagemMaterial";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { AppInput } from "@/components/commons/AppInput";
import { toaster } from "@/components/commons/toaster";
import { FaSearch } from "react-icons/fa";
import { Missao, MissaoConteudo } from "@/types_consts/missao";
import { obterNomeTematica, Tematica, TematicaDTO } from "@/types_consts/tematica";
import { MissaoAPI } from "../../api/missao";
import { TematicaAPI } from "../../api/tematica";
import { mensagensErroConsole } from "@/config/mensagensError";
import { mensagensToastErro } from "@/config/mensagensToaster";

type GrupoTematica = {
    tematica: string;
    materiais: MissaoConteudo[];
};

export default function BancoMateriais() {
    const navigate = useNavigate();

    const [missoesPorTematica, setMissoesPorTematica] = useState<GrupoTematica[]>([]);
    const [termoBusca, setTermoBusca] = useState("");

    const materiaisFiltrados = useMemo(() => {
        if (!termoBusca.trim()) {
            return missoesPorTematica;
        }

        const busca = termoBusca.toLowerCase();

        return missoesPorTematica
            .map(grupoTematica => ({
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
            .filter(grupo => grupo.materiais.length > 0);
    }, [termoBusca, missoesPorTematica]);

    async function carregarDados() {
        try {
            const [tematicasResponse, missoesResponse] = await Promise.all([
                TematicaAPI.listar(),
                MissaoAPI.listar(),
            ]);

            if (!tematicasResponse.data) {
                toaster.create(mensagensToastErro.carregarTematicas);
                return;
            }
            const tematicas = tematicasResponse.data as TematicaDTO[];

            if (!missoesResponse.data) {
                toaster.create(mensagensToastErro.carregarMissoesConteudo);
                return;
            }
            const missoes = missoesResponse.data as Missao[];
            const missoesMateriais = missoes.filter((m): m is MissaoConteudo => "tipoMaterial" in m);

            if (!missoesMateriais) return;

            const missoesFiltradas = tematicas
                .map(tematica => ({
                    tematica: obterNomeTematica(tematica.titulo) || tematica.titulo,
                    materiais: missoesMateriais.filter(
                        missao => missao.tematica.id === tematica.id
                    )
                }))
                .sort((a, b) => {
                    const NOME_TAREFA_FINAL = "Tarefa Final"; // Ajuste para a string exata se necessário
                    if (a.tematica.toLowerCase() === NOME_TAREFA_FINAL.toLowerCase()) return 1;
                    if (b.tematica.toLowerCase() === NOME_TAREFA_FINAL.toLowerCase()) return -1;
                    return 0;
                });

            setMissoesPorTematica(missoesFiltradas);

        } catch (erro) {
            console.error(mensagensErroConsole.buscarGenerico, erro);
            toaster.create(mensagensToastErro.carregarGenerico);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <CardCustomizado
            titulo="Banco de missões de textos e vídeos"
            mensagem="Faça cadastro, edição e exclusão de textos e vídeos para a trilha formativa."
        >
            <Flex
                direction="column"
                justify="center"
                gap="3"
                mt={6}
            >
                <HStack justify="space-between" flex="1">
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
                    {materiaisFiltrados.map(grupoTematica => (
                        <Box
                            my={3}
                            p={4} // Adicionado padding interno para dar espaço ao redor do conteúdo com sombra
                            borderRadius="lg" // Borda arredondada para destacar a sombra
                            bg="white" // Fundo branco para a sombra se destacar
                            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.08)" // Sombra igual à listagem de questões
                            key={grupoTematica.tematica}
                        >
                            <Heading
                                textStyle="headingMD"
                                color="brand.primaryDark"
                                mb={3}
                            >
                                {grupoTematica.tematica}
                            </Heading>
                            <Stack gap={2}>
                                {grupoTematica.materiais.map(material => (
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
    );
}