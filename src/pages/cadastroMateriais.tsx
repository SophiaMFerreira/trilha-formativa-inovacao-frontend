import { AppInput } from "@/components/commons/AppInput";
import { Button, createListCollection, Dialog, Em, Field, Fieldset, Heading, InputGroup, ListCollection, Portal, RadioGroup, Select, Stack, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { MissaoAPI } from "../../api/missao";
import { TematicaAPI } from "../../api/tematica";
import { TematicaDTO } from "@/types_consts/tematica";
import { Missao, MissaoConteudo, MissaoDTO, tipoMaterialLabel } from "@/types_consts/missao";
import { validarConteudo } from "@/utils/validations/missaoConteudo";

export default function CadastroMateriais() {
    const { idMissao } = useParams();
    const navigate = useNavigate();

    const [acao, setAcao] = useState("Cadastro")
    const [mensagem, setMensagem] = useState("cadastro de novos")
    const [acaoBotao, setAcaoBotao] = useState("Cadastrar material")

    const [idMissaoMaterial, setIdMissao] = useState<number>(-1)
    const [idTrilha, setIdTrilha] = useState<number>(-1)
    const [tipoMaterial, setTipoMaterial] = useState<string>("texto")
    const [titulo, setTitulo] = useState<string>("")
    const [url, setUrl] = useState<string>("")
    const [resumo, setResumo] = useState<string>("")
    const [pontuacao, setPontuacao] = useState<number>(0)

    const [tematicas, setTematicas] = useState<TematicaDTO[]>([])
    const [tematicasCollection, setTematicasCollection] = useState<ListCollection>(createListCollection({
        items: [
            {
                label: "Nenhuma temática cadastrada",
                value: "-1",
            },
        ]
    }));

    const [openModalConfirmacao, setOpenModalConfirmacao] = useState(false)

    const [validacaoIdMissaoMaterial, setValidacaoIdMissaoMaterial] = useState(false)
    const [validacaoIdTrilha, setValidacaoIdTrilha] = useState(false)
    const [validacaoTipoMaterial, setValidacaoTipoMaterial] = useState(false)
    const [validacaoTitulo, setValidacaoTitulo] = useState(false)
    const [validacaoURL, setValidacaoURL] = useState(false)
    const [validacaoResumo, setValidacaoResumo] = useState(false)
    const [validacaoPontuacao, setValidacaoPontuacao] = useState(false)


    useEffect(() => {
        async function carregarDados() {
            try {
                const tematicaResponse = await TematicaAPI.listar()
                if (!tematicaResponse.data) return // MENSAGEM DE ERRO

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

                if (idMissao) {
                    setAcao("Edição")
                    setMensagem("edição dos")
                    setAcaoBotao("Salvar alterações")
                    const missaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))
                    if (!missaoResponse.data) {
                        //MENSAGEM DE ERRO
                        navigate("/banco-materiais");
                    }

                    const missao = missaoResponse.data as Missao
                    if (!("tipoMaterial" in missao)) return //MENSAGEM DE ERRO

                    const material = missao as MissaoConteudo

                    setIdMissao(Number(material.id));
                    setIdTrilha(Number(material.tematica.id));
                    setTipoMaterial(material.tipoMaterial);
                    setTitulo(material.titulo);
                    setUrl(material.url);
                    setResumo(material.resumo);
                    setPontuacao(Number(material.pontuacao));
                }
            } catch (erro) {
                console.error(erro);
                //MENSAGEM DE ERRO
            }
        }

        carregarDados();
    }, [idMissao]);


    const onSubmit = async () => {
        const resultado = validarConteudo({
            titulo,
            pontuacao,
            idMissaoMaterial,
            idTrilha,
            url,
            resumo,
            tipoMaterial,
            edicao: idMissao ? true : false
        });

        if (resultado.valido) {
            setValidacaoIdMissaoMaterial(!resultado.idMissaoMaterial);
            setValidacaoIdTrilha(!resultado.idTrilha);
            setValidacaoTipoMaterial(!resultado.tipoMaterial);
            setValidacaoTitulo(!resultado.titulo);
            setValidacaoURL(!resultado.url);
            setValidacaoResumo(!resultado.resumo);
            setValidacaoPontuacao(!resultado.pontuacao);

            //MENSAGEM DE ERRO
            return;
        }
        try {
            const missaoPayload = {
                titulo: titulo,
                pontuacao: pontuacao,
                tipoMissao: "conteudo",
                url: url,
                resumo: resumo,
                tipoMaterial: tipoMaterial,
                idTematica: idTrilha,
            } as unknown

            if (idMissao) {
                await MissaoAPI.atualizar(idMissaoMaterial, missaoPayload as MissaoDTO)
            } else {
                await MissaoAPI.salvar(missaoPayload as MissaoDTO)
            }

            navigate("/banco-materiais")
        } catch (e) {
            console.error(e)
            //MENSAGEM ERRO
        }
    };

    const onExclude = () => {
        try {
            if (!idMissao) return
            MissaoAPI.deletar(idMissaoMaterial)
            navigate("/banco-materiais")

        } catch (erro) {
            console.error(erro);
        }
    }

    return (
        <CardCustomizado
            titulo={`${acao} de materiais de estudo`}
            mensagem={`Faça ${mensagem} de materiais de estudo para a trilha formativa.`}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}>
                <Stack
                    gap="4"
                    mt={6}
                >
                    <Stack
                        direction={{
                            base: "column",
                            md: "row",
                        }}
                        gap="10"
                        justifyContent="space-between"
                    >
                        <Field.Root
                            required
                            invalid={validacaoIdTrilha}
                        >
                            <Select.Root
                                collection={tematicasCollection}
                                disabled={tematicas?.length === 0}
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
                                    Selecione uma temática para o conteúdo.
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                        <Fieldset.Root invalid={validacaoTipoMaterial}>
                            <Fieldset.Legend
                                textStyle="bodyTextBold"
                                color="brand.primaryDark"
                            >
                                Tipo de material
                                <Em color="brand.secondaryRed">*</Em>
                            </Fieldset.Legend>
                            <RadioGroup.Root
                                name="tipoConteudo"
                                value={tipoMaterial}
                                onValueChange={(details) => {
                                    setTipoMaterial(details.value ?? "texto");
                                }}
                                ml="8"
                                size="sm"
                                my="1"
                            >
                                <Stack gap="1.5">
                                    <RadioGroup.Item
                                        key="texto"
                                        value="texto"
                                        defaultChecked={true}
                                    >
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator
                                            borderColor="brand.neutral"
                                            _checked={{
                                                borderColor: "brand.neutral",
                                                bg: "brand.secondary",
                                                color: "brand.white",
                                            }}
                                        />
                                        <RadioGroup.ItemText
                                            color="brand.neutral"
                                            textStyle="inputPlaceholder"
                                        >
                                            Material de texto
                                        </RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                    <RadioGroup.Item
                                        key="video"
                                        value="video"
                                        textStyle="bodyText"
                                        color="brand.neutral"
                                    >
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator
                                            borderColor="brand.neutral"
                                            _checked={{
                                                borderColor: "brand.neutral",
                                                bg: "brand.secondary",
                                                color: "brand.white",
                                            }}
                                        />
                                        <RadioGroup.ItemText
                                            color="brand.neutral"
                                            textStyle="inputPlaceholder"
                                        >
                                            Material em vídeo
                                        </RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                </Stack>
                            </RadioGroup.Root>
                            {validacaoTipoMaterial && (
                                <Field.ErrorText
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    Selecione o tipo de material: texto ou vídeo.
                                </Field.ErrorText>
                            )}
                        </Fieldset.Root>
                    </Stack>
                    <Stack
                        direction={{
                            base: "column",
                            md: "row",
                        }}
                        gap="10"
                        justifyContent="space-between"
                    >
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
                                    Informe um título para o conteúdo. O título deve ter no máximo 255 caracteres.
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                        <Field.Root required invalid={validacaoPontuacao}>
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
                                maxW="170px"
                                onChange={(e) => setPontuacao(Number(e.target.value))}
                            />
                            {validacaoPontuacao && (
                                <Field.ErrorText
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    Informe uma pontuação válida entre 1 e 9999.
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                    </Stack>
                    <Field.Root required invalid={validacaoURL}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Link
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="url"
                                value={url}
                                placeholder="https://link-do-site/pagina.com"
                                size="md"
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </InputGroup>
                        {validacaoURL && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                Informe uma URL válida, contendo 'https://' ou 'http://'.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Field.Root required invalid={validacaoResumo}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Resumo
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <Textarea
                            name="resumo"
                            value={resumo}
                            placeholder="Um breve resumo do material"
                            variant="outline"
                            size="md"
                            h="56"

                            fontStyle="bodyText"
                            borderRadius="sm"
                            borderWidth="1px"
                            bg="transparent"
                            color="brand.neutral"
                            borderColor="brand.neutral"

                            _hover={{
                                borderColor: "brand.primaryDark",
                                color: "brand.primaryDark",
                                bg: "#2f9e411f",
                            }}
                            _focusVisible={{
                                borderColor: "brand.primaryDark",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-primaryDark)",
                            }}
                            _invalid={{
                                borderColor: "brand.error",
                                boxShadow: "0 0 0 2px rgba(26, 9, 8, 0.25)",
                            }}
                            onChange={(e) => setResumo(e.target.value)}
                        />
                        {validacaoResumo && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                Informe um resumo para o conteúdo. Informe um resumo para o conteúdo.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
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
                                onClick={() => navigate("/banco-materiais")}
                            >
                                Voltar
                            </Button>}
                        {idMissao &&
                            <Button
                                flex={1}
                                w="100%"
                                variant="danger"
                                onClick={() => setOpenModalConfirmacao(true)}
                                size="md"
                            >
                                Excluir material
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
                open={openModalConfirmacao}
                onOpenChange={(e) => setOpenModalConfirmacao(e.open)}
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
                                    Excluir material
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="justify"
                                    pb="4"
                                >
                                    Você está prestes a excluir este material. Após a confirmação, ela será removida permanentemente e não poderá ser recuperada.
                                </Text>
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    w="fit-content"
                                    mx="auto"
                                    gap="5"
                                    align="center"
                                >
                                    <Heading textStyle="emphasis" color="brand.primaryDark">
                                        {tipoMaterialLabel[tipoMaterial as keyof typeof tipoMaterialLabel]}
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
                                            setOpenModalConfirmacao(false)
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="danger"
                                        onClick={() => {
                                            setOpenModalConfirmacao(false)
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
        </CardCustomizado>
    );
}