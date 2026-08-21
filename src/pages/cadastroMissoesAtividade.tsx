import CardCustomizado from "@/components/commons/cardCustomizado";
import { AppInput } from "@/components/commons/AppInput";
import { Box, Button, createListCollection, Dialog, Em, Field, Grid, GridItem, Heading, InputGroup, Listbox, ListCollection, Portal, Select, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TematicaDTO } from "@/types_consts/tematica";
import { Missao, MissaoAtividade, MissaoDTO, MissaoTarefa, TipoAtividade, TipoAtividadeLabel } from "@/types_consts/missao";
import { TematicaAPI } from "../../api/tematica";
import { QuestaoProp } from "@/types_consts/questao";
import { DistintivoDTO } from "@/types_consts/distintivo";
import { MissaoAPI } from "../../api/missao";
import { FaSearch } from "react-icons/fa";
import { DistintivoAPI } from "../../api/distintivos";
import ListagemQuestao from "@/components/listagemQuestao";
import { DadosAtuaisProps, validarAtividade } from "@/utils/validations/missaoAtividade";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

export default function CadastroMissoesAtividade() {
    const { idMissao } = useParams();
    const navigate = useNavigate();

    const [acao, setAcao] = useState("Cadastro")
    const [mensagem, setMensagem] = useState("cadastro de novas")
    const [acaoBotao, setAcaoBotao] = useState("Cadastrar missão atividade")

    const [idMissaoAtividade, setIdMissaoAtividade] = useState<number>(-1)
    const [idTrilha, setIdTrilha] = useState<number>(-1)
    const [tipoAtividade, setTipoAtividade] = useState<string>(TipoAtividade.QUIZ)
    const [titulo, setTitulo] = useState<string>("")
    const [pontuacao, setPontuacao] = useState<number>(0)
    const [idDistintivo, setIdDistintivo] = useState<number>(-1)
    const [distintivos, setDistintivos] = useState<DistintivoDTO[]>([])
    const [questoes, setQuestoes] = useState<QuestaoProp[]>([])

    const [tematicas, setTematicas] = useState<TematicaDTO[]>([])
    const [tematicasCollection, setTematicasCollection] = useState<ListCollection>(createListCollection({
        items: [
            {
                label: "Nenhuma temática cadastrada",
                value: "-1",
            },
        ]
    }));

    const tipoAtividadeCollection = createListCollection({
        items: Object.values(TipoAtividade).map(tipo => ({
            label: TipoAtividadeLabel[tipo],
            value: tipo,
        })),
    });

    const [termoBusca, setTermoBusca] = useState("");
    const distintivosFiltrados = useMemo(() => {
        if (!termoBusca.trim()) {
            return distintivos;
        }
        const busca = termoBusca.toLowerCase();

        return distintivos.filter(distintivo => {
            distintivo.titulo.toLowerCase().includes(busca) ||
                distintivo.nomeArquivo.toLowerCase().includes(busca) ||
                String(distintivo.pontuacao).includes(busca)
        })
    }, [termoBusca, distintivos]);
    const distintivosFiltradosCollection = useMemo(() => {
        return createListCollection({
            items: distintivosFiltrados.map(d => ({
                label: d.titulo,
                value: String(d.id),
            }))
        })
    }, [distintivosFiltrados]);

    const [openModalConfirmacaoMissao, setOpenModalConfirmacaoMissao] = useState(false)
    const [openModalConfirmacaoQuestao, setOpenModalConfirmacaoQuestao] = useState(false)

    const [dadosAtuais, setDadosAtuais] = useState<DadosAtuaisProps>({
        idTrilha: -1,
        tipoAtividade: TipoAtividade.QUIZ
    });
    const [validacaoIdMissaoAtividade, setValidacaoIdMissaoAtividade] = useState(false);
    const [validacaoIdTrilha, setValidacaoIdTrilha] = useState(false);
    const [validacaoIdTrilhaMantida, setValidacaoIdTrilhaMantida] = useState(false);
    const [validacaoTipoAtividade, setValidacaoTipoAtividade] = useState(false);
    const [validacaoTipoAtividadeMantido, setValidacaoTipoAtividadeMantido] = useState(false);
    const [validacaoTitulo, setValidacaoTitulo] = useState(false);
    const [validacaoPontuacao, setValidacaoPontuacao] = useState(false);
    const [validacaoDistintivo, setValidacaoDistintivo] = useState(false);

    async function carregarDadosMissao() {
        try {
            if (idMissao) {
                const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                if (!missaoResponse.data) {
                    toaster.create(mensagensToastErro.carregarMissoesAtividade)
                    navigate("/banco-missoes-atividade")
                }

                const missao = missaoResponse.data as Missao
                if (!("tipoAtividade" in missao)) {
                    toaster.create(mensagensToastErro.carregarMissoesTipoIncompativel)
                    navigate("/banco-missoes-atividade")
                }

                const atividade = missao as MissaoAtividade

                setIdMissaoAtividade(Number(atividade.id))
                setIdTrilha(Number(atividade.tematica.id))
                setTipoAtividade(atividade.tipoAtividade)
                setTitulo(atividade.titulo)
                setPontuacao(Number(atividade.pontuacao))

                const questoes = atividade.questoes as QuestaoProp[]
                setQuestoes(questoes)

                if (
                    "distintivo" in missao &&
                    missao.tipoAtividade !== TipoAtividade.QUIZ
                ) {
                    const tarefa = atividade as MissaoTarefa
                    setIdDistintivo(tarefa.distintivo.id)
                }

                setDadosAtuais({
                    idTrilha: Number(atividade.tematica.id),
                    tipoAtividade: atividade.tipoAtividade
                })
            }
        } catch (erro) {
            console.error(mensagensErroConsole.buscarGenerico, erro);
            navigate("/banco-missoes-atividade");
        }
    }

    useEffect(() => {
        async function carregarDados() {
            try {
                const [
                    tematicaResponse,
                    distintivosResponse,
                ] = await Promise.all([
                    TematicaAPI.listar(),
                    DistintivoAPI.listar(),
                ]);
                if (!tematicaResponse.data) {
                    toaster.create(mensagensToastErro.carregarTematicas)
                    return
                }

                const tematicas = tematicaResponse.data as TematicaDTO[]
                const tematicasCollection = createListCollection({
                    items:
                        tematicas.length === 0
                            ? [
                                {
                                    label: "Nenhuma temática cadastrada",
                                    value: "-1",
                                },
                            ]
                            : tematicas.map(item => ({
                                label: item.titulo,
                                value: String(item.id),
                            })),
                })
                setTematicas(tematicas)
                setTematicasCollection(tematicasCollection)

                if (!distintivosResponse.data) {
                    toaster.create(mensagensToastErro.carregarDistintivos)
                    return
                }

                const distintivos = distintivosResponse.data as DistintivoDTO[]
                setDistintivos(distintivos)

                if (idMissao) {
                    setAcao("Edição")
                    setMensagem("edição das")
                    setAcaoBotao("Salvar alterações")

                    await carregarDadosMissao()
                }
            } catch (erro) {
                console.error(mensagensErroConsole.buscarGenerico, erro);
                navigate("/banco-missoes-atividade");
            }
        }

        carregarDados();
    }, [idMissao]);

    const onSubmit = async () => {
        const resultado = validarAtividade({
            titulo,
            pontuacao,
            idMissaoAtividade,
            idTrilha,
            tipoAtividade,
            idDistintivo,
            dadosAtuais,
            edicao: idMissao ? true : false
        });

        if (resultado.valido) {
            setValidacaoIdMissaoAtividade(!resultado.idMissaoAtividade);
            setValidacaoIdTrilha(!resultado.idTrilha);
            setValidacaoIdTrilhaMantida(!resultado.trilhaMantida);
            setValidacaoTitulo(!resultado.titulo);
            setValidacaoTipoAtividade(!resultado.tipoAtividade);
            setValidacaoTipoAtividadeMantido(!resultado.tipoAtividadeMantido);
            setValidacaoPontuacao(!resultado.pontuacao);
            setValidacaoDistintivo(!resultado.distintivo);

            toaster.create(mensagensToastErro.validarMissaoAtividade)
            return;
        }

        try {
            const missaoPayload = {
                titulo: titulo,
                pontuacao: pontuacao,
                tipoMissao: "atividade",
                tipoAtividade: tipoAtividade,
                idTematica: idTrilha,
                ...(tipoAtividade !== "quiz" && { idDistintivo: idDistintivo }),
                ...(idMissaoAtividade !== -1 && { id: idMissaoAtividade }),
            } as unknown

            if (idMissao) {
                await MissaoAPI.atualizar(idMissaoAtividade, missaoPayload as MissaoDTO)

                toaster.create(mensagensToastSucesso.editarMissao)
            } else {
                await MissaoAPI.salvar(missaoPayload as MissaoDTO)

                toaster.create(mensagensToastSucesso.salvarMissao)
            }
            navigate("/banco-missoes-atividade")

        } catch (e) {
            console.error(mensagensErroConsole.salvarMissaoAtividade, e);
        }
    };

    const onExclude = () => {
        try {
            if (!idMissao) return
            MissaoAPI.deletar(idMissaoAtividade)

            toaster.create(mensagensToastSucesso.excluirMissao)
            navigate("/banco-missoes-atividade")

        } catch (erro) {
            console.error(mensagensErroConsole.excluirMissaoAtividade, erro)
            toaster.create(mensagensToastErro.excluirMissao)
        }
    }
    return (
        <CardCustomizado
            titulo={`${acao} de missões atividade`}
            mensagem={`Faça ${mensagem} missões atividade para a trilha formativa.`}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}>
                <Stack
                    gap="4"
                    mt={6}
                >
                    <Grid
                        templateColumns="1fr 1fr"
                        templateRows="repeat(3, auto)"
                        gap={6}
                    >
                        <GridItem>
                            <Field.Root
                                required
                                invalid={validacaoIdTrilha || validacaoIdTrilhaMantida}
                            >
                                <Select.Root
                                    collection={tematicasCollection}
                                    disabled={tematicas?.length === 0 || idMissao !== undefined}
                                    name="trilha"
                                    value={idTrilha !== -1 ? [String(idTrilha)] : []}
                                    onValueChange={(details) => {
                                        setIdTrilha(Number(details.value[0]));
                                    }}

                                    size="md"
                                    maxW="md"
                                >
                                    <Select.HiddenSelect />
                                    <Select.Label
                                        textStyle="bodyTextBold"
                                        color="brand.primaryDark"
                                    >
                                        Trilha
                                        <Field.RequiredIndicator color="brand.secondaryRed" />
                                    </Select.Label>
                                    <Select.Control>
                                        <Select.Trigger
                                            borderWidth="1px"
                                            borderColor="brand.neutral"
                                            borderRadius="sm"
                                            bg="brand.white"
                                        >
                                            <Select.ValueText
                                                placeholder="Selecione a trilha formativa"
                                                textStyle="inputPlaceholder"
                                                color="brand.neutral"

                                                _hover={{
                                                    bg: "rgba(47,158,65,.05)",
                                                    borderColor: "brand.secondary"
                                                }}
                                                _focusVisible={{
                                                    borderColor: "brand.secondary",
                                                    boxShadow: "0 0 0 2px rgba(47,158,65,.18)",
                                                    color: "brand.primaryDark"
                                                }}
                                            />
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator
                                                color="brand.neutral"
                                            />
                                        </Select.IndicatorGroup >
                                    </Select.Control>
                                    <Portal>
                                        <Select.Positioner>
                                            <Select.Content
                                                textStyle="inputPlaceholder"
                                                color="brand.neutral"
                                            >
                                                {tematicasCollection.items.map((trilha) => (
                                                    <Select.Item
                                                        _hover={{
                                                            bg: "rgba(47,158,65,.08)"
                                                        }}
                                                        _highlighted={{
                                                            bg: "rgba(47,158,65,.12)",
                                                            color: "brand.primaryDark"
                                                        }}
                                                        _checked={{
                                                            color: "brand.primaryDark"
                                                        }}

                                                        item={trilha}
                                                        key={trilha.value}
                                                    >
                                                        {trilha.label}
                                                        <Select.ItemIndicator />
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Portal>
                                </Select.Root>
                                {validacaoIdTrilha && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        Selecione uma temática válida.
                                    </Field.ErrorText>
                                )}
                                {validacaoIdTrilhaMantida && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        A temática não pode ser alterada durante a edição
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                        </GridItem>
                        {tipoAtividade !== TipoAtividade.QUIZ && (
                            <GridItem
                                rowSpan={3}
                            >
                                <Stack
                                    gap="1"
                                    h="100%"
                                >
                                    <Text
                                        textStyle="bodyTextBold"
                                        color="brand.primaryDark"
                                    >
                                        Distintivo
                                        <Em color="brand.secondaryRed">*</Em>
                                    </Text>
                                    <Box
                                        borderRadius="sm"
                                        borderWidth="1px"
                                        bg="transparent"
                                        color="brand.neutral"
                                        borderColor="brand.neutral"
                                        h="100%"
                                    >
                                        <Box h="100%">
                                            <Listbox.Root
                                                collection={distintivosFiltradosCollection}
                                                defaultValue={idDistintivo !== -1 ? [String(idDistintivo)] : [""]}
                                            >
                                                <InputGroup
                                                    endElement={
                                                        <Box color="brand.primaryDark">
                                                            <FaSearch />
                                                        </Box>
                                                    }
                                                    maxW="sm"
                                                >
                                                    <AppInput
                                                        border="none"
                                                        outline="none"
                                                        boxShadow="none"
                                                        _focus={{
                                                            border: "none",
                                                            boxShadow: "none",
                                                        }}
                                                        _focusVisible={{
                                                            border: "none",
                                                            boxShadow: "none",
                                                        }}

                                                        borderBottom="1px solid"
                                                        borderColor="brand.neutral"

                                                        placeholder="Pesquisar missão"
                                                        appVariant="outline"
                                                        value={termoBusca}
                                                        onChange={(e) => setTermoBusca(e.target.value)}
                                                    />
                                                </InputGroup>
                                                <Listbox.Content
                                                    boxShadow="none"
                                                    border="none"
                                                >
                                                    {distintivosFiltradosCollection.items.map((distintivo) => (
                                                        <Listbox.Item
                                                            item={distintivo}
                                                            key={distintivo.value}
                                                            onClick={() =>
                                                                setIdDistintivo(Number(distintivo.value))
                                                            }

                                                            _hover={{
                                                                bg: "#2f9e411f",
                                                                color: "brand.primaryDark",
                                                            }}
                                                            _highlighted={{
                                                                bg: "#2f9e411f",
                                                                color: "brand.primaryDark",
                                                            }}
                                                            _selected={{
                                                                color: "brand.primaryDark",
                                                                bg: "#2f9e411f",
                                                            }}
                                                        >
                                                            <Box
                                                                px="3"
                                                                rounded="sm"
                                                                w="100%"
                                                                h="100%"
                                                            >
                                                                <Listbox.ItemText>
                                                                    {distintivo.label}
                                                                </Listbox.ItemText>
                                                            </Box>
                                                            <Listbox.ItemIndicator />
                                                        </Listbox.Item>
                                                    ))}
                                                    <Listbox.Empty
                                                    >
                                                        <Box
                                                            px="3"
                                                            rounded="sm"
                                                        >
                                                            Nenhum distintivo cadastrado
                                                        </Box>
                                                    </Listbox.Empty>
                                                </Listbox.Content>
                                            </Listbox.Root>
                                        </Box>
                                    </Box>
                                    {validacaoDistintivo && (
                                        <Text
                                            textStyle="inputPlaceholder"
                                            color="brand.secondaryRed"
                                            textAlign="end"
                                        >
                                            Selecione um distintivo válido.
                                        </Text>
                                    )}
                                </Stack>
                            </GridItem>
                        )}
                        <GridItem>
                            <Field.Root
                                required
                                invalid={validacaoTipoAtividade || validacaoTipoAtividadeMantido}
                            >
                                <Select.Root
                                    collection={tipoAtividadeCollection}
                                    disabled={Object.values(TipoAtividade).length === 0 || idMissao !== undefined}
                                    name="tipoAtividade"
                                    value={[tipoAtividade]}
                                    onValueChange={(details) => {
                                        setTipoAtividade(details.value[0]);
                                    }}

                                    size="md"
                                    maxW="md"
                                >
                                    <Select.HiddenSelect />
                                    <Select.Label
                                        textStyle="bodyTextBold"
                                        color="brand.primaryDark"
                                    >
                                        Tipo de atividade
                                        <Field.RequiredIndicator color="brand.secondaryRed" />
                                    </Select.Label>
                                    <Select.Control>
                                        <Select.Trigger
                                            borderWidth="1px"
                                            borderColor="brand.neutral"
                                            borderRadius="sm"
                                            bg="brand.white"
                                        >
                                            <Select.ValueText
                                                placeholder="Selecione a trilha formativa"
                                                textStyle="inputPlaceholder"
                                                color="brand.neutral"

                                                _hover={{
                                                    bg: "rgba(47,158,65,.05)",
                                                    borderColor: "brand.secondary"
                                                }}
                                                _focusVisible={{
                                                    borderColor: "brand.secondary",
                                                    boxShadow: "0 0 0 2px rgba(47,158,65,.18)",
                                                    color: "brand.primaryDark"
                                                }}
                                            />
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator
                                                color="brand.neutral"
                                            />
                                        </Select.IndicatorGroup >
                                    </Select.Control>
                                    <Portal>
                                        <Select.Positioner>
                                            <Select.Content
                                                textStyle="inputPlaceholder"
                                                color="brand.neutral"
                                            >
                                                {tipoAtividadeCollection.items.map((tipoAtvdd) => (
                                                    <Select.Item
                                                        _hover={{
                                                            bg: "rgba(47,158,65,.08)"
                                                        }}
                                                        _highlighted={{
                                                            bg: "rgba(47,158,65,.12)",
                                                            color: "brand.primaryDark"
                                                        }}
                                                        _checked={{
                                                            color: "brand.primaryDark"
                                                        }}

                                                        item={tipoAtvdd}
                                                        key={tipoAtvdd.value}
                                                    >
                                                        {tipoAtvdd.label}
                                                        <Select.ItemIndicator />
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Portal>
                                </Select.Root>
                                {validacaoTipoAtividade && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        Selecione um tipo de atividade válido
                                    </Field.ErrorText>
                                )}
                                {validacaoTipoAtividadeMantido && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        O tipo de atividade não pode ser alterado durante a edição.
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                        </GridItem>
                        <GridItem>
                            <Field.Root
                                required
                                invalid={validacaoPontuacao}
                            >
                                <Field.Label
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                >
                                    Valor da missão
                                    <Field.RequiredIndicator color="brand.secondaryRed" />
                                </Field.Label>
                                <AppInput
                                    name="pontuacao"
                                    value={pontuacao}
                                    placeholder="100"
                                    size="sm"
                                    type="number"
                                    min="0"
                                    max="9999"
                                    onChange={(e) => setPontuacao(Number(e.target.value))}
                                />
                                {validacaoPontuacao && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        A pontuação deve ser um número inteiro entre 1 e 9999.
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                        </GridItem>
                    </Grid>
                    <Field.Root required invalid={validacaoTitulo}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Título
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <AppInput
                            name="titulo"
                            value={titulo}
                            placeholder="Título do material"
                            size="md"
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                        {validacaoTitulo && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                O título é obrigatório e deve ter no máximo 255 caracteres.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    {questoes.length !== 0 &&
                        <>
                            <Text
                                textStyle="emphasis"
                                color="brand.primaryDark"
                            >
                                Questões
                            </Text>
                            <Stack
                                gap="3"
                            >
                                {questoes.map(questao => (
                                    <ListagemQuestao
                                        key={questao.id}
                                        {...questao}
                                        onExcluir={carregarDadosMissao}
                                    />
                                ))}
                            </Stack>
                        </>
                    }
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="100%"
                        gap="4"
                    >
                        {idMissao &&
                            <Button
                                flex={1}
                                w="100%"
                                variant="outline"
                                onClick={() => navigate("/banco-missoes-atividade")}
                            >
                                Voltar
                            </Button>}
                        {idMissao &&
                            <Button
                                flex={1}
                                w="100%"
                                variant="danger"
                                onClick={() => setOpenModalConfirmacaoMissao(true)}
                                size="md"
                            >
                                Excluir missão
                            </Button>}
                        <Button
                            flex={1}
                            w="100%"
                            variant="solid"
                            type="submit"
                        >
                            {acaoBotao}
                        </Button>
                    </Stack>
                </Stack>
            </form>

            <Dialog.Root
                size="md"
                lazyMount
                placement="center"
                open={openModalConfirmacaoMissao}
                onOpenChange={(e) => setOpenModalConfirmacaoMissao(e.open)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title
                                    textStyle="headingMD"
                                    color="brand.secondaryRed"
                                >
                                    Excluir missão
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="justify"
                                    pb="4"
                                >
                                    Você está prestes a excluir esta missãoa atividade. Após a confirmação, ela será removida permanentemente e não poderá ser recuperada.
                                </Text>
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    w="fit-content"
                                    mx="auto"
                                    gap="5"
                                    align="center"
                                >
                                    <Heading textStyle="emphasis" color="brand.primaryDark">
                                        {TipoAtividadeLabel[tipoAtividade as keyof typeof TipoAtividadeLabel]}
                                    </Heading>
                                    <Text
                                        textStyle="bodyText"
                                        color="brand.neutral"
                                        maxW="320px"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        whiteSpace="nowrap"
                                        boxSizing="border-box"
                                    >
                                        {titulo}
                                    </Text>
                                    <Text
                                        textStyle="bodyText"
                                        color="brand.primaryDark"
                                        maxW="320px"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        whiteSpace="nowrap"
                                        boxSizing="border-box"
                                    >
                                        {pontuacao}
                                    </Text>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer justifyContent="center">
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    w="100%"
                                    gap="2"
                                >
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="outline"
                                        onClick={() => {
                                            setOpenModalConfirmacaoMissao(false)
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="danger"
                                        onClick={() => {
                                            setOpenModalConfirmacaoMissao(false)
                                            onExclude()
                                        }}
                                    >
                                        Excluir
                                    </Button>
                                </Stack>
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