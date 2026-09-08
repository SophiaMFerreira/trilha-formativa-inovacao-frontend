import { useCallback, useEffect, useMemo, useState } from "react";

import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Box, Collapsible, Flex, Heading, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";

import { ProgressoMissaoAPI } from "../../api/progressoMissao";
import { ProgressoMissao } from "@/types_consts/missao";
import { mensagensErroConsole } from "@/config/mensagensError";
import { toaster } from "./commons/toaster";
import { mensagensToastErro } from "@/config/mensagensToaster";
import { pontuacaoDoProgresso } from "@/utils/pontuacao";
import { urlDaFotoDePerfil } from "@/utils/fotoPerfil";
import { mensagemDeErroDaApi } from "@/utils/erroApi";
import { gerarRankingResumido, RankingUsuario } from "@/utils/ranking";

export function Ranking() {
    const { user } = useAuth()
    const { pontuacao, progressoTotal } = useGame()

    /*
     * Todos os hooks vêm antes de qualquer retorno condicional. A
     * versão anterior fazia o early return de <Navigate /> acima dos
     * useState/useEffect: com isso a quantidade de hooks variava entre
     * renderizações, o que quebra as regras de hooks do React.
     */
    const [progressos, setProgressos] = useState<ProgressoMissao[] | null>(null);
    const [aberturaManual, setAberturaManual] = useState<boolean | null>(null);

    const idUsuario = user?.id;

    useEffect(() => {
        if (!idUsuario) return;

        let ativo = true;

        async function carregarProgressos() {
            try {
                const resposta = await ProgressoMissaoAPI.listar();

                if (!ativo) return;

                setProgressos(
                    Array.isArray(resposta.data)
                        ? resposta.data as ProgressoMissao[]
                        : []
                );
            } catch (erro) {
                if (!ativo) return;

                console.error(
                    mensagensErroConsole.buscarProgressos,
                    mensagemDeErroDaApi(erro) ?? erro
                );
                toaster.create(mensagensToastErro.falhaAoCarregarRanking);

                /*
                 * Lista vazia aqui significa "não foi possível carregar
                 * o ranking dos outros", não "ninguém pontuou". O
                 * usuário logado continua sendo exibido logo abaixo,
                 * com a pontuação que o GameProvider já calculou.
                 */
                setProgressos([]);
            }
        }

        carregarProgressos();

        return () => { ativo = false };
    }, [idUsuario]);

    /*
     * O ranking só é recalculado quando os progressos mudam. Antes,
     * gerarRankingResumido() rodava a cada renderização do componente.
     */
    const ranking = useMemo<RankingUsuario[]>(() => {
        if (!progressos) return [];

        const porUsuario = new Map<number, RankingUsuario>();

        for (const progresso of progressos) {
            const usuario = progresso?.usuario;

            /* Linha sem usuário é dado inconsistente: ignora a linha, não a lista. */
            if (!usuario?.id) continue;

            if (!porUsuario.has(usuario.id)) {
                porUsuario.set(usuario.id, {
                    indice: 0,
                    id: usuario.id,
                    nomeAventureiro: usuario.nomeAventureiro,
                    /*
                     * Usuário sem foto entra no ranking com o avatar
                     * padrão. A versão anterior fazia "continue" nesse
                     * caso e o usuário simplesmente desaparecia da
                     * classificação.
                     */
                    imagem: urlDaFotoDePerfil(usuario),
                    pontuacao: 0,
                });
            }

            porUsuario.get(usuario.id)!.pontuacao += pontuacaoDoProgresso(progresso);
        }

        return [...porUsuario.values()]
            .sort((a, b) =>
                b.pontuacao - a.pontuacao ||
                a.nomeAventureiro.localeCompare(b.nomeAventureiro)
            )
            .map((usuario, posicao) => ({ ...usuario, indice: posicao + 1 }));
    }, [progressos]);

    /*
     * Garante a exigência de exibir integralmente os dados do usuário
     * logado mesmo quando não há outros usuários — ou quando o
     * carregamento do ranking falhou.
     */
    const rankingCompleto = useMemo<RankingUsuario[]>(() => {
        if (!user) return ranking;
        if (ranking.some(u => u.id === user.id)) return ranking;

        return [
            ...ranking,
            {
                indice: ranking.length + 1,
                id: user.id,
                nomeAventureiro: user.nomeAventureiro,
                imagem: undefined,
                pontuacao,
            },
        ];
    }, [ranking, user, pontuacao]);

    const { rankingExibido, meuRanking } = useMemo(
        () => gerarRankingResumido(rankingCompleto, user?.id),
        [rankingCompleto, user?.id]
    );

    const carregando = progressos === null;

    /*
     * Abre por padrão quando já existe progresso, mas respeita o
     * clique do usuário a partir do momento em que ele interage. Antes
     * isso era um setState dentro de efeito, que reabria o painel toda
     * vez que a pontuação era recalculada.
     */
    const aberto = aberturaManual ?? progressoTotal > 0;

    const alternarAbertura = useCallback(
        (abrir: boolean) => setAberturaManual(abrir),
        []
    );

    if (!user) return null;

    return (
        <Box
            p="4"
            bg="brand.primaryLight"
            w="72"
            rounded="xl"
            shadow="card"
        >
            <Collapsible.Root
                open={aberto}
                onOpenChange={(e) => alternarAbertura(e.open)}
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
                        {aberto ? "Ranking" : "Meus pontos"}
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
                        {carregando
                            ? Array.from({ length: 3 }, (_, i) => (
                                <Skeleton key={i} h="12" rounded="lg" />
                            ))
                            : rankingExibido.map(u => (
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
            {!aberto &&
                <ItemRanking
                    posicao={meuRanking}
                    nomeAventureiro={user.nomeAventureiro}
                    pontuacao={pontuacao}
                    imagem={rankingExibido.find(u => u.id === user.id)?.imagem}
                    usuario={true}
                />
            }
        </Box>
    );
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
                    <Avatar.Fallback name={nomeAventureiro} />
                    {imagem && <Avatar.Image src={imagem} />}
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
                {Math.round(pontuacao)}
            </Text>
        </Flex>
    );
}
