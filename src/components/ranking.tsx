import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Box, Collapsible, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";

import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { Missao, ProgressoMissao, ProgressoMissaoAtividade } from "@/types_consts/missao";
import { mensagensErroConsole } from "@/config/mensagensError";
import { toaster } from "./commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { UsuarioAPI } from "../../api/usuario";
import { Usuario } from "@/types_consts/usuario";

type RankingUsuario = {
    indice: number;
    id: number;
    nomeAventureiro: string;
    imagem: string | undefined;
    pontuacao: number;
}

export function Ranking() {
    const { user } = useAuth()
    const { pontuacao, progressoTotal } = useGame()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    const [open, setOpen] = useState(true)

    const [usuario, setUsuario] = useState<Usuario>()
    const [imagem, setImagem] = useState<string | undefined>();
    const [progressosMissoes, setProgressosMissoes] = useState<RankingUsuario[]>([]);
    const { rankingExibido, meuRanking } = gerarRankingResumido(progressosMissoes, user.nomeAventureiro);

    useEffect(() => {
        if (!user) return;

        async function carregarDados() {
            try {
                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user?.id))
                const usuario = usuarioResponse.data as Usuario

                if (!usuario) return;

                setUsuario(usuario)
            } catch (erro) {
                toaster.create(mensagensToastErro.carregarUsuario)
                console.error(mensagensErroConsole.buscarAventureiro, erro);
            }
        }
        carregarDados();
    }, [user?.id]);

    useEffect(() => {
        async function carregarImagem() {
            try {
                if (!user) return;
                if (!usuario?.fotoPerfil) return;

                const nomeImagem = usuario.fotoPerfil.split("/").pop();
                if (!nomeImagem) return;

                const fotoPerfilResponse = await UsuarioAPI.buscarImagemPerfil(usuario.id, usuario.nomeAventureiro, nomeImagem);
                setImagem(fotoPerfilResponse);

                /*if (fotoPerfilResponse.data) {
                    const url = URL.createObjectURL(fotoPerfilResponse.data);
                    setImagem(url);
                }*/
            } catch (erro) {
                toaster.create(mensagensToastErro.carregarFotoPerfil)
                console.error(mensagensErroConsole.buscarFotoPerfil, erro);
            }
        }
        carregarImagem();
    }, [usuario?.id, usuario?.fotoPerfil]);
    useEffect(() => {
        async function carregarDados() {
            try {
                const progressoMissaoResponse = await ProgressoMissaoAPI.listar()
                const progressos = progressoMissaoResponse.data as ProgressoMissao[]

                if (!progressos) return;

                const rankingMap = new Map<number, RankingUsuario>();

                for (const progresso of progressos) {
                    const id = progresso.usuario.id;

                    if (!progresso.usuario?.fotoPerfil) continue

                    const nomeImagem = progresso.usuario.fotoPerfil.split("/").pop();
                    if (!nomeImagem) continue;

                    const fotoPerfilResponse = await UsuarioAPI.buscarImagemPerfil(
                        progresso.usuario.id, progresso.usuario.nomeAventureiro, nomeImagem);

                    if (!rankingMap.has(id)) {
                        const usuario = {
                            indice: 0,
                            id,
                            nomeAventureiro: progresso.usuario.nomeAventureiro,
                            imagem: fotoPerfilResponse,
                            pontuacao: 0,
                        };

                        rankingMap.set(id, usuario);
                    }

                    let pontos = 0
                    let missao = progresso.missao as Missao
                    if ("tipoMaterial" in missao) {
                        pontos = progresso.missao.pontuacao
                        pontos = (Number(progresso.progresso) || 0) ?
                            Number(progresso.missao.pontuacao) : 0

                    } else {
                        const atividade = progresso as ProgressoMissaoAtividade
                        pontos = Number(atividade.pontuacaoObtida) || 0
                    }

                    rankingMap.get(id)!.pontuacao += pontos;
                }

                const rankingArray = [...rankingMap.values()]
                    .sort((a, b) => b.pontuacao - a.pontuacao)
                    .map((usuario, indice) => ({
                        ...usuario,
                        indice: indice + 1,
                    }));

                setProgressosMissoes(rankingArray)

            } catch (erro) {
                console.error(mensagensErroConsole.buscarProgressos, erro);
                toaster.create(mensagensToastErro.falhaAoCarregarRanking)
            }
        }
        carregarDados();
        setOpen(progressoTotal > 0);
    }, [progressoTotal]);

    return (
        <Box
            p="4"
            bg="brand.primaryLight"
            w="72"
            rounded="xl"
            shadow="card"
        >
            <Collapsible.Root
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                lazyMount
                unmountOnExit={false}
            >
                <Collapsible.Trigger
                    paddingY="3"
                    display="flex"
                    gap="2"
                    alignItems="center"
                    py="3"
                    position="relative"
                    w="100%"
                    justifyContent="center"
                >
                    <Heading
                        textStyle="headingSM"
                        color="brand.primaryDark"
                    >
                        {open ? "Ranking" : "Meus pontos"}
                    </Heading>
                    <Collapsible.Indicator
                        transition="transform 0.2s"
                        _open={{ transform: "rotate(180deg)" }}
                        color="brand.primaryDark"
                    >
                        <FaAngleDown size={18} />
                    </Collapsible.Indicator>
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <Stack padding="0.5">
                        {rankingExibido.map(u => (
                            <ItemRanking
                                key={u.id}
                                posicao={u.indice}
                                nomeAventureiro={u.nomeAventureiro}
                                pontuacao={u.pontuacao}
                                imagem={u.imagem}
                                usuario={u.id === user.id}
                            />
                        ))}
                    </Stack>
                </Collapsible.Content>
            </Collapsible.Root>
            {!open &&
                <ItemRanking
                    posicao={meuRanking}
                    nomeAventureiro={user.nomeAventureiro}
                    pontuacao={pontuacao}
                    imagem={imagem}
                    usuario={true}
                />
            }
        </Box>
    );
}

type RankingResumido = {
    rankingExibido: RankingUsuario[];
    meuRanking: number;
};

function gerarRankingResumido(
    ranking: RankingUsuario[],
    nomeUsuario: string
): RankingResumido {
    const indice = ranking.findIndex(
        u => u.nomeAventureiro === nomeUsuario
    );

    const resultado = [];

    resultado.push(...ranking.slice(0, 3));

    if (indice > 2)
        resultado.push(ranking[indice - 1]);

    if (indice >= 0)
        resultado.push(ranking[indice]);

    if (indice < ranking.length - 1)
        resultado.push(ranking[indice + 1]);

    const unicos = resultado.filter(
        (item, index, array) =>
            array.findIndex(i => i.id === item.id) === index
    );

    let i = 3;

    while (unicos.length < 8 && i < ranking.length) {
        if (!unicos.some(u => u.id === ranking[i].id))
            unicos.splice(3, 0, ranking[i]);

        i++;
    }

    return {
        rankingExibido: unicos.sort(
            (a, b) =>
                ranking.findIndex(u => u.id === a.id) -
                ranking.findIndex(u => u.id === b.id)
        ),
        meuRanking: indice >= 0 ? indice + 1 : 0
    }
}

export type ItemRankingProps = {
    posicao: number;
    nomeAventureiro: string;
    pontuacao: number;
    imagem?: string;
    usuario: boolean;
}
function ItemRanking({
    posicao,
    nomeAventureiro,
    pontuacao,
    imagem,
    usuario,
}: ItemRankingProps) {
    return (
        <Flex
            p="2.5"
            w="100%"
            bg="brand.white"
            rounded="lg"
            justify="space-between"
            align="center"
            gap="2"
            color={usuario ? "brand.primaryDark" : "brand.neutral"}
        >
            <HStack
                gap="1"
                textStyle={usuario ? "bodyTextBold" : "bodyText"}
            >
                <Text w="20px">{String(posicao).padStart(2, "0")}</Text>
                <Avatar.Root
                    size="sm"
                    mr="1"
                    color={usuario ? "brand.primaryDark" : "brand.neutral"}
                    bg={usuario ? "#2f9e411f" : "gray.200"}
                >
                    <Avatar.Fallback />
                    <Avatar.Image src={imagem} />
                </Avatar.Root>

                <Text
                    flex="1"
                    lineClamp={2}
                    wordBreak="break-word"
                    textOverflow="ellipsis"
                >{nomeAventureiro}</Text>
            </HStack>
            <Text
                textStyle="navigation"
                fontWeight={usuario ? "700" : "500"}
            >
                {pontuacao}
            </Text>
        </Flex>
    );
}