import { useEffect, useMemo, useState } from "react";
import { Editable, Listbox } from "@ark-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import CardCustomizado from "@/components/commons/cardCustomizado";
import { AppInput } from "@/components/commons/AppInput";
import { Box, Button, createListCollection, Dialog, Em, Field, Grid, Heading, HStack, IconButton, Image, InputGroup, Portal, RadioCard, RadioGroup, Select, Skeleton, Stack, Text, Textarea } from "@chakra-ui/react";
import { FaExclamationCircle, FaSearch, FaTimes } from "react-icons/fa";
import CustomTooltip from "@/components/commons/customTooltip";
import { obterNomeTematica, TematicaDTO } from "@/types_consts/tematica";
import { Alternativa, AlternativaAssociacao, AlternativaAssociacaoDTO, AlternativaAssociadaDTO, AlternativaAssociadaPutDTO, AlternativaDTO, AlternativaMultiplaEscolha, AlternativaMultiplaEscolhaDTO, AlternativaOrdenacao, AlternativaOrdenacaoDTO, SubtipoAlternativa, SubtipoAlternativaLabel, TipoAlternativa, TipoAlternativaLabel } from "@/types_consts/alternativa";
import { Missao, MissaoAtividade, TipoAtividade, TipoAtividadeLabel } from "@/types_consts/missao";
import { TematicaAPI } from "../../api/tematica";
import { QuestaoDTO, QuestaoProp } from "@/types_consts/questao";
import { MissaoAPI } from "../../api/missao";
import { AlternativaAPI } from "../../api/alternativa";
import { MultiplaEscolhaCadastroQuiz, MultiplaEscolhaCadastroTarefa } from "@/components/commons/TarefaQuestao/multiplaEscolha";
import { AssociacaoCadastroQuiz, AssociacaoCadastroTarefa, colunasAssociadas } from "@/components/commons/TarefaQuestao/associacao";
import { OrdenacaoCadastroQuiz, OrdenacaoCadastroTarefa } from "@/components/commons/TarefaQuestao/ordenacao";
import { QuestaoAPI } from "../../api/questao";
import { DadosAtuaisProps, validarQuestao } from "@/utils/validations/questao";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";
import { mensagensAjudaQuestoes, mensagensAjudaQuestoesModal } from "@/config/mensagemAjudaQuestoes";

import ajudaMultiplaEscolha from "@/assets/images/exemploQuestao/ajudaAlternativaMultiplaEscolha.png";
import ajudaVerdadeiroFalso from "@/assets/images/exemploQuestao/ajudaAlternativaVerdadeiroFalso.png";
import ajudaMultiplaEscolhaVarias from "@/assets/images/exemploQuestao/ajudaAlternativaMultiplaEscolhaVarias.png";
import ajudaOrdenacao from "@/assets/images/exemploQuestao/ajudaAlternativaOrdenacao.png";
import ajudaAssociacao from "@/assets/images/exemploQuestao/ajudaAlternativaAssociacao.png";

export default function CadastroQuestoes() {
    const { idQuestao, idMissao } = useParams();
    const navigate = useNavigate();

    const [acao, setAcao] = useState("Cadastro")
    const [mensagem, setMensagem] = useState("cadastro de novas")
    const [acaoBotao, setAcaoBotao] = useState("Cadastrar questão")

    const [openModalExclusao, setOpenModalExclusao] = useState(false)
    const [openModalAjuda, setOpenModalAjuda] = useState(false)
    const [loadedAjuda, setLoadedAjuda] = useState(false)
    const imagemAjuda: Record<string, string> = {
        [TipoAlternativa.ASSOCIACAO]: ajudaAssociacao,
        [TipoAlternativa.ORDENACAO]: ajudaOrdenacao,
        [SubtipoAlternativa.MULTIPLA_ESCOLHA]: ajudaMultiplaEscolha,
        [SubtipoAlternativa.VERDADEIRO_FALSO]: ajudaVerdadeiroFalso,
        [SubtipoAlternativa.MULTIPLAS_CORRETAS]: ajudaMultiplaEscolhaVarias,
    };

    const estiloTags = {
        h: "5",
        borderWidth: "1px",
        textStyle: "bodyText",
        rounded: "sm",
        cursor: "pointer",
        px: "1",
        py: "1",
        _hover: {
            borderColor: "brand.primaryDark",
            color: "brand.primaryDark",
            bg: "#2f9e411f",
        },

        _focusVisible: {
            outline: "2px solid",
            outlineColor: "brand.primaryDark",
            outlineOffset: "2px",
        },

        _checked: {
            bg: "brand.secondary",
            color: "brand.primaryLight",
            borderColor: "brand.secondary",
            fontWeight: "bold",
        },
    }

    const [tematicas, setTematicas] = useState<TematicaDTO[]>([])
    const tiposAtividade = Object.values(TipoAtividade).map(tipo => ({
        titulo: TipoAtividadeLabel[tipo],
        value: tipo,
    }))
    const tiposAlternativaCollection = createListCollection({
        items: [
            ...Object.values(SubtipoAlternativa).map(subtipo => ({
                label: SubtipoAlternativaLabel[subtipo],
                value: subtipo,
            })),
            {
                label: TipoAlternativaLabel[TipoAlternativa.ORDENACAO],
                value: TipoAlternativa.ORDENACAO,
            },
            {
                label: TipoAlternativaLabel[TipoAlternativa.ASSOCIACAO],
                value: TipoAlternativa.ASSOCIACAO,
            },
        ],
    });

    const [id, setId] = useState(-1)
    const [enunciado, setEnunciado] = useState("")
    const [mensagemCorrecao, setMensagemCorrecao] = useState("")

    const [tipoAlternativa, setTipoAlternativa] = useState<string>("")
    const [alternativas, setAlternativas] = useState<Alternativa[]>(
        Array(4).fill({
            id: -1,
            texto: "",
            tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
            correta: false,
            subtipo: SubtipoAlternativa.MULTIPLA_ESCOLHA
        } as AlternativaMultiplaEscolha)
    )
    const [tipoAlternativaLabel, setTipoAlternativaLabel] = useState<string>("Tipo desconhecido");

    const [idAtividade, setIdAtividade] = useState(-1)
    const [missoes, setMissoes] = useState<MissaoAtividade[]>([]);
    const [tipoAtividade, setTipoAtividade] = useState("")
    const [tematica, setTematica] = useState("")

    const [termoBusca, setTermoBusca] = useState("");
    const missoesFiltradas = useMemo(() => {
        const busca = termoBusca.trim().toLowerCase();

        return missoes.filter(missao => {
            const atendeBusca =
                !busca ||
                missao.titulo.toLowerCase().includes(busca);

            const atendeTematica =
                !tematica || missao.tematica.titulo === tematica;

            const atendeTipo =
                !tipoAtividade || missao.tipoAtividade === tipoAtividade;

            return atendeBusca && atendeTematica && atendeTipo;
        })
    }, [
        termoBusca,
        tematica,
        tipoAtividade,
        missoes
    ]);
    const missoesFiltradasCollection = useMemo(() => {
        return createListCollection({
            items: missoesFiltradas.map(mf => ({
                label: mf.titulo,
                value: String(mf.id),
            }))
        })
    }, [missoesFiltradas]);

    useEffect(() => {
        if (idQuestao) return

        switch (tipoAlternativa) {
            case TipoAlternativa.ASSOCIACAO:
                setAlternativas(
                    Array.from({ length: 4 }, (_, i) => {
                        const idA = -(i * 2 + 1)
                        const idB = -(i * 2 + 2)

                        return {
                            id: idA,
                            texto: "Conteúdo da alternativa",
                            tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                            alternativaAssociada: {
                                id: idB,
                                texto: "Conteúdo da alternativa associada",
                                correta: true
                            },
                        }
                    }) as AlternativaAssociacao[]
                )
                setTipoAlternativaLabel(TipoAlternativaLabel[tipoAlternativa])
                break;
            case TipoAlternativa.ORDENACAO:
                setAlternativas(
                    Array.from({ length: 4 }, (_, i) => ({
                        id: -(i + 1),
                        texto: "Conteúdo da alternativa",
                        tipoAlternativa: TipoAlternativa.ORDENACAO,
                        ...(i !== 0 && { numeroSequencia: i }),
                        numeroSequencia: i + 1
                    } as AlternativaOrdenacao))
                )
                setTipoAlternativaLabel(TipoAlternativaLabel[tipoAlternativa])
                break;
            case SubtipoAlternativa.VERDADEIRO_FALSO:
                setAlternativas(
                    Array.from({ length: 2 }, (_, i) => ({
                        id: -(i + 1),
                        texto: "Conteúdo da alternativa",
                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                        correta: false,
                        subtipo: SubtipoAlternativa.VERDADEIRO_FALSO,
                    }))
                )
                setTipoAlternativaLabel(SubtipoAlternativaLabel[tipoAlternativa])
                break;
            case SubtipoAlternativa.MULTIPLAS_CORRETAS:
                setAlternativas(
                    Array.from({ length: 4 }, (_, i) => ({
                        id: -(i + 1),
                        texto: "Conteúdo da alternativa",
                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                        correta: false,
                        subtipo: SubtipoAlternativa.MULTIPLAS_CORRETAS,
                    }))
                )
                setTipoAlternativaLabel(SubtipoAlternativaLabel[tipoAlternativa])
                break;
            case SubtipoAlternativa.MULTIPLA_ESCOLHA:
                setTipoAlternativaLabel(SubtipoAlternativaLabel[tipoAlternativa])
            default:
                setAlternativas(
                    Array.from({ length: 4 }, (_, i) => ({
                        id: -(i + 1),
                        texto: "Conteúdo da alternativa",
                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                        correta: false,
                        subtipo: SubtipoAlternativa.MULTIPLA_ESCOLHA,
                    }))
                )
                break;
        }
    }, [idQuestao, tipoAlternativa]);

    useEffect(() => {
        async function carregarDados() {
            try {
                const tematicaResponse = await TematicaAPI.listar()

                if (!tematicaResponse.data) {
                    toaster.create(mensagensToastErro.carregarTematicas)
                    return
                }
                const tematicas = tematicaResponse.data as TematicaDTO[]

                setTematicas(tematicas)

                if (idMissao && idQuestao) {
                    const misaoResponse = await MissaoAPI.buscarPorId(Number(idMissao))

                    if (!misaoResponse.data) {
                        toaster.create(mensagensToastErro.carregarMissoesAtividade)
                        return
                    }
                    const missao = misaoResponse.data as MissaoAtividade

                    const questaoMissao = missao.questoes.find(q => q.id === Number(idQuestao))
                    if (!questaoMissao) {
                        toaster.create(mensagensToastErro.carregarQuestoes)
                        return
                    }

                    const questao = questaoMissao as QuestaoProp

                    setAcao("Edição")
                    setMensagem("edição das")
                    setAcaoBotao("Salvar alterações")

                    setIdAtividade(missao.id)
                    setTematica(missao.tematica.titulo)
                    setTipoAtividade(missao.tipoAtividade)

                    setId(Number(questao.id));
                    setEnunciado(questao.enunciado);
                    setMensagemCorrecao(questao.mensagemCorrecao);
                    setMissoes([missao])

                    if (!questao.alternativas?.length) return;

                    setTipoAlternativa(questao.alternativas[0].tipoAlternativa);
                    let tipoAlt = questao.alternativas[0].tipoAlternativa as string

                    if (questao.alternativas[0].tipoAlternativa === TipoAlternativa.MULTIPLA_ESCOLHA) {
                        setTipoAlternativa(questao.alternativas[0].subtipo)
                        tipoAlt = questao.alternativas[0].subtipo as string
                    }

                    switch (tipoAlt) {
                        case TipoAlternativa.ASSOCIACAO:
                            setAlternativas(
                                (questao.alternativas as AlternativaAssociacao[]).map(
                                    (alternativa): AlternativaAssociacao => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto,
                                        tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                                        alternativaAssociada: {
                                            id: alternativa.alternativaAssociada.id,
                                            texto: alternativa.alternativaAssociada.texto,
                                            tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                                        }
                                    }
                                    )
                                ))

                            break;
                        case TipoAlternativa.ORDENACAO:
                            setAlternativas(
                                (questao.alternativas as AlternativaOrdenacao[]).map(
                                    (alternativa): AlternativaOrdenacao => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto,
                                        tipoAlternativa: TipoAlternativa.ORDENACAO,
                                        numeroSequencia: alternativa.numeroSequencia
                                    })
                                ) as AlternativaOrdenacao[])

                            break;
                        case SubtipoAlternativa.VERDADEIRO_FALSO:
                            setAlternativas(
                                (questao.alternativas as AlternativaMultiplaEscolha[]).map(
                                    (alternativa): AlternativaMultiplaEscolha => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto,
                                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                                        correta: alternativa.correta,
                                        subtipo: SubtipoAlternativa.VERDADEIRO_FALSO,
                                    })
                                ) as AlternativaMultiplaEscolha[])

                            break;
                        case SubtipoAlternativa.MULTIPLAS_CORRETAS:
                            setAlternativas(
                                (questao.alternativas as AlternativaMultiplaEscolha[]).map(
                                    (alternativa): AlternativaMultiplaEscolha => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto,
                                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                                        correta: alternativa.correta,
                                        subtipo: SubtipoAlternativa.MULTIPLAS_CORRETAS,
                                    })
                                ) as AlternativaMultiplaEscolha[])

                            break;
                        case SubtipoAlternativa.MULTIPLA_ESCOLHA:
                        default:
                            setAlternativas(
                                (questao.alternativas as AlternativaMultiplaEscolha[]).map(
                                    (alternativa): AlternativaMultiplaEscolha => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto,
                                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                                        correta: alternativa.correta,
                                        subtipo: SubtipoAlternativa.MULTIPLA_ESCOLHA,
                                    })
                                ) as AlternativaMultiplaEscolha[])
                            break;
                    }

                    setDadosAtuais({
                        tematica: missao.tematica.titulo,
                        idAtividade,
                        tipoAtividade,
                        tipoAlternativa
                    })

                } else {
                    const misaoResponse = await MissaoAPI.listar()

                    if (!misaoResponse.data) {
                        toaster.create(mensagensToastErro.carregarMissoesAtividade)
                        navigate("/banco-questoes");
                    }
                    const missao = misaoResponse.data as Missao[]
                    const atividade = missao.filter((m): m is MissaoAtividade => "tipoAtividade" in m)

                    const missoesAtividade = atividade as MissaoAtividade[]
                    setMissoes(missoesAtividade)
                }

            } catch (erro) {
                console.error(erro);
                console.error(mensagensErroConsole.buscarGenerico, erro);
                navigate("/banco-questoes");
            }
        }

        carregarDados();
    }, [idQuestao, idMissao]);

    const [dadosAtuais, setDadosAtuais] = useState<DadosAtuaisProps>({
        tematica: "",
        idAtividade: -1,
        tipoAtividade: TipoAtividade.QUIZ,
        tipoAlternativa: SubtipoAlternativa.MULTIPLA_ESCOLHA
    });
    const [validacaoIdQuestao, setValidacaoIdQuestao] = useState(false);
    const [validacaoEnunciado, setValidacaoEnunciado] = useState(false);
    const [validacaoMensagemCorrecao, setValidacaoMensagemCorrecao] = useState(false);
    const [validacaoTipoAlternativa, setValidacaoTipoAlternativa] = useState(false);
    const [validacaoTipoAlternativaMantida, setValidacaoTipoAlternativaMantida] = useState(false);
    const [validacaoTematica, setValidacaoTematica] = useState(false);
    const [validacaoTrilhaMantida, setValidacaoTrilhaMantida] = useState(false);
    const [validacaoIdAtividade, setValidacaoIdAtividade] = useState(false);
    const [validacaoTipoAtividade, setValidacaoTipoAtividade] = useState(false);
    const [validacaoIdAtividadeMantido, setValidacaoIdAtividadeMantido] = useState(false);
    const [validacaoTipoAtividadeMantido, setValidacaoTipoAtividadeMantido] = useState(false);
    const [validacaoAlternativas, setValidacaoAlternativas] = useState(false);

    const onSubmit = async () => {

        const resultado = validarQuestao({
            idQuestao: id,
            enunciado,
            mensagemCorrecao,
            tematica,
            tipoAlternativa,
            idAtividade,
            tipoAtividade,
            dadosAtuais,
            alternativas,
            edicao: idQuestao ? true : false
        });

        if (resultado.valido) {
            setValidacaoIdQuestao(resultado.idQuestao);
            setValidacaoEnunciado(resultado.enunciado);
            setValidacaoMensagemCorrecao(resultado.mensagemCorrecao);
            setValidacaoTipoAlternativa(resultado.tipoAlternativa);
            setValidacaoTipoAlternativaMantida(resultado.tipoAlternativaMantida);
            setValidacaoTematica(resultado.trilha);
            setValidacaoTrilhaMantida(resultado.trilhaMantida);
            setValidacaoIdAtividade(resultado.idAtividade);
            setValidacaoIdAtividadeMantido(resultado.tipoAtividade);
            setValidacaoTipoAtividade(resultado.tipoAtividade);
            setValidacaoTipoAtividadeMantido(resultado.tipoAtividadeMantido);
            setValidacaoAlternativas(resultado.alternativas);

            toaster.create(mensagensToastErro.validarQuestao)
            return
        }

        const questaoPayload = {
            enunciado: enunciado,
            mensagemCorrecao: mensagemCorrecao
        } as QuestaoDTO

        if (idQuestao) {
            let alternativasPayload: AlternativaDTO[] = [];
            if (tipoAlternativa === TipoAlternativa.ASSOCIACAO) {
                alternativasPayload = (alternativas as AlternativaAssociacao[]).map(
                    (alternativa): AlternativaAssociacaoDTO => ({
                        id: alternativa.id,
                        texto: alternativa.texto,
                        tipoAlternativa: alternativa.tipoAlternativa,
                        alternativaAssociada: {
                            idAlternativaAssociada: alternativa.alternativaAssociada.id,
                            texto: alternativa.alternativaAssociada.texto,
                            tipoAlternativa: alternativa.alternativaAssociada.tipoAlternativa,
                        } as AlternativaAssociadaPutDTO
                    })
                )
            }
            if (tipoAlternativa === TipoAlternativa.ORDENACAO) {
                alternativasPayload = (alternativas as AlternativaOrdenacao[]).map(
                    (alternativa): AlternativaOrdenacaoDTO => ({
                        id: alternativa.id,
                        texto: alternativa.texto,
                        tipoAlternativa: alternativa.tipoAlternativa,
                        numeroSequencia: alternativa.numeroSequencia,
                    })
                )
            }
            if (tipoAlternativa === SubtipoAlternativa.MULTIPLAS_CORRETAS ||
                tipoAlternativa === SubtipoAlternativa.MULTIPLA_ESCOLHA ||
                tipoAlternativa === SubtipoAlternativa.VERDADEIRO_FALSO
            ) {
                alternativasPayload = (alternativas as AlternativaMultiplaEscolha[]).map(
                    (alternativa): AlternativaMultiplaEscolhaDTO => ({
                        id: alternativa.id,
                        texto: alternativa.texto,
                        tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                        subtipo: alternativa.subtipo,
                        correta: alternativa.correta,
                    })
                )
            }

            try {
                await QuestaoAPI.atualizar(idAtividade, id, questaoPayload)

                try {
                    await Promise.all(
                        alternativasPayload
                            .map(alternativa =>
                                AlternativaAPI.atualizar(id, alternativa.id!, alternativa as AlternativaDTO)
                            )
                    )
                } catch (erroAlternativasUpdate) {
                    toaster.create(mensagensToastErro.editarQuestao)
                    console.error(mensagensErroConsole.editarQuestao, erroAlternativasUpdate)
                }

                toaster.create(mensagensToastSucesso.editarQuestao)

            } catch (erroQuestaoUpdate) {
                toaster.create(mensagensToastErro.editarQuestao)
                console.error(mensagensErroConsole.editarQuestao, erroQuestaoUpdate)
            }

        } else {
            try {
                /*const questaoResponse = await QuestaoAPI.salvar(idAtividade, questaoPayload)
                
                if (!questaoResponse.data) return // MENSAGEM DE ERRO
                const questao = questaoResponse.data
                */
                await QuestaoAPI.salvar(idAtividade, questaoPayload)

                const questaoResponse = await QuestaoAPI.listar()

                if (!questaoResponse.data) {
                    toaster.create(mensagensToastErro.carregarQuestoes)
                    return
                }
                const questoes = questaoResponse.data as QuestaoProp[]

                const questao = questoes.find(q => (
                    q.enunciado === enunciado &&
                    q.idMissao === idAtividade &&
                    q.mensagemCorrecao === mensagemCorrecao))
                if (!questao) {
                    toaster.create(mensagensToastErro.carregarQuestoes)
                    return
                }

                let alternativasPayload: AlternativaDTO[] = []
                if (tipoAlternativa === TipoAlternativa.ASSOCIACAO) {
                    alternativasPayload = (alternativas as AlternativaAssociacao[]).map(
                        (alternativa): AlternativaAssociacaoDTO => ({
                            texto: alternativa.texto,
                            tipoAlternativa: TipoAlternativa.ASSOCIACAO,
                            alternativaAssociada: {
                                texto: alternativa.alternativaAssociada.texto,
                                correta: true
                            } as AlternativaAssociadaDTO
                        })
                    )
                }
                if (tipoAlternativa === TipoAlternativa.ORDENACAO) {
                    alternativasPayload = (alternativas as AlternativaOrdenacao[]).map(
                        (alternativa): AlternativaOrdenacaoDTO => ({
                            texto: alternativa.texto,
                            tipoAlternativa: alternativa.tipoAlternativa,
                            numeroSequencia: alternativa.numeroSequencia,
                        })
                    )
                }
                if (tipoAlternativa === SubtipoAlternativa.MULTIPLAS_CORRETAS ||
                    tipoAlternativa === SubtipoAlternativa.MULTIPLA_ESCOLHA ||
                    tipoAlternativa === SubtipoAlternativa.VERDADEIRO_FALSO
                ) {
                    alternativasPayload = (alternativas as AlternativaMultiplaEscolha[]).map(
                        (alternativa): AlternativaMultiplaEscolhaDTO => ({
                            texto: alternativa.texto,
                            tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
                            subtipo: tipoAlternativa,
                            correta: alternativa.correta,
                        })
                    )
                }

                try {
                    await Promise.all(
                        alternativasPayload
                            .map(alternativa =>
                                AlternativaAPI.salvar(questao.id, alternativa as AlternativaDTO)
                            )
                    )
                } catch (erroAlternativas) {
                    toaster.create(mensagensToastErro.editarQuestao)
                    console.error(mensagensErroConsole.editarQuestao, erroAlternativas)

                    try {
                        await QuestaoAPI.deletar(questao.idMissao, questao.id)
                    } catch (erroDeleteQuestao) {
                        console.error(mensagensErroConsole.editarQuestao, erroDeleteQuestao)
                    }

                    throw erroAlternativas;
                }
            } catch (erroSalvarQuestao) {
                toaster.create(mensagensToastErro.editarQuestao)
                console.error(mensagensErroConsole.editarQuestao, erroSalvarQuestao)
            }
        }

        navigate("/banco-questoes");
    }

    const onExclude = () => {
        try {
            if (!idQuestao) return
            QuestaoAPI.deletar(idAtividade, id)
            toaster.create(mensagensToastSucesso.excluirQuestao)
            navigate("/banco-questoes")

        } catch (erro) {
            toaster.create(mensagensToastErro.excluirQuestao)
            console.error(mensagensErroConsole.excluirQuestao, erro)
        }
    }

    return (
        <CardCustomizado
            titulo={`${acao} de questões`}
            mensagem={`Faça ${mensagem} de questões para a trilha formativa.`}
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
                        templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                        }}
                        gap="8"
                    >
                        <Stack
                            gap="5">
                            <RadioCard.Root
                                align="center"
                                maxW="lg"
                                required
                                invalid={validacaoTematica || validacaoTrilhaMantida}
                                disabled={idQuestao ? true : false}
                                w="100%"
                            >
                                <RadioCard.Label
                                    textStyle="bodyTextBold"
                                    color="brand.primaryDark"
                                >
                                    Trilha
                                    <Em color="brand.secondaryRed">*</Em>
                                </RadioCard.Label>
                                <RadioGroup.Root
                                    value={tematica}
                                    onValueChange={(details) => {
                                        if (details.value !== null) {
                                            setTematica(details.value);
                                        }
                                    }}
                                    disabled={idQuestao ? true : false}
                                >
                                    <Grid
                                        templateColumns={{
                                            base: "1fr",
                                            md: "repeat(2, 1fr)",
                                        }}
                                        gap="2"
                                        w="100%"
                                    >
                                        {tematicas.map((t) => (
                                            <RadioCard.Item
                                                key={t.titulo}
                                                value={t.titulo}
                                                minH="14"
                                            >
                                                <RadioCard.ItemHiddenInput />
                                                <RadioCard.ItemControl
                                                    {...estiloTags}
                                                    bg="brand.primaryLight"
                                                    color="brand.neutral"
                                                    borderColor="brand.neutral"
                                                >
                                                    <RadioCard.ItemText>
                                                        {obterNomeTematica(t.titulo) || t.titulo}
                                                    </RadioCard.ItemText>
                                                </RadioCard.ItemControl>
                                            </RadioCard.Item>
                                        ))}
                                    </Grid>
                                </RadioGroup.Root>
                                {validacaoTematica && (
                                    <Text
                                        key="validacaoTematica"
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                        textAlign="end"
                                    >
                                        Selecione uma temática válida.
                                    </Text>
                                )}
                                {validacaoTrilhaMantida && (
                                    <Text
                                        key="validacaoTrilhaMantida"
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                        textAlign="end"
                                    >
                                        A temática não pode ser alterada durante a edição.
                                    </Text>
                                )}
                            </RadioCard.Root>
                            <RadioCard.Root
                                align="center"
                                maxW="md"
                                required
                                invalid={validacaoTipoAtividade || validacaoTipoAtividadeMantido}
                                disabled={idQuestao ? true : false}
                            >
                                <RadioCard.Label
                                    textStyle="bodyTextBold"
                                    color="brand.primaryDark"
                                >
                                    Tipo de missão atividade
                                    <Em color="brand.secondaryRed">*</Em>
                                </RadioCard.Label>
                                <RadioGroup.Root
                                    flex="1"
                                    value={tipoAtividade}
                                    onValueChange={(details) => {
                                        if (details.value !== null) {
                                            setTipoAtividade(details.value as TipoAtividade);
                                        }
                                    }}
                                    disabled={idQuestao ? true : false}
                                >
                                    <HStack
                                        w="100%"
                                        gap="2"
                                        wrap="wrap"
                                    >
                                        {tiposAtividade.map((ta) => (
                                            <RadioCard.Item
                                                key={ta.titulo}
                                                value={ta.value}
                                            >
                                                <RadioCard.ItemHiddenInput />
                                                <RadioCard.ItemControl
                                                    {...estiloTags}
                                                    bg="brand.primaryDark"
                                                    color="brand.primaryLight"
                                                    borderColor="transparent"
                                                >
                                                    <RadioCard.ItemText

                                                    >
                                                        {ta.titulo}
                                                    </RadioCard.ItemText>
                                                </RadioCard.ItemControl>
                                            </RadioCard.Item>
                                        ))}
                                    </HStack>
                                </RadioGroup.Root>
                                {validacaoTipoAtividade && (
                                    <Text
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                        textAlign="end"
                                    >
                                        Selecione um missão atividade válido.
                                    </Text>
                                )}
                                {validacaoTipoAtividadeMantido && (
                                    <Text
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        O tipo de missão atividade não pode ser alterado durante a edição.
                                    </Text>
                                )}
                            </RadioCard.Root>
                            <Field.Root
                                required
                                invalid={validacaoTipoAlternativa || validacaoTipoAlternativaMantida}
                                disabled={idQuestao ? true : false}
                            >
                                <Select.Root
                                    collection={tiposAlternativaCollection}
                                    disabled={Object.values(TipoAlternativa).length === 0 ||
                                        idQuestao ? true : false
                                    }
                                    name="tipoAlternativa"
                                    value={tipoAlternativa ? [tipoAlternativa] : []}
                                    onValueChange={(details) => {
                                        setTipoAlternativa(details.value[0]);
                                    }}

                                    size="md"
                                    maxW="md"
                                >
                                    <Select.HiddenSelect />
                                    <Select.Label
                                        textStyle="bodyTextBold"
                                        color="brand.primaryDark"
                                    >
                                        Tipo de questão
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
                                                placeholder="Selecione o tipo de questão"
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
                                                {tiposAlternativaCollection.items.map((tipoA) => (
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

                                                        item={tipoA}
                                                        key={tipoA.value}
                                                        hidden={(tipoA.value === TipoAlternativa.ORDENACAO ||
                                                            tipoA.value === TipoAlternativa.ASSOCIACAO) && tipoAtividade === TipoAtividade.TAREFA
                                                        }
                                                    >
                                                        {tipoA.label}
                                                        <Select.ItemIndicator />
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Portal>
                                </Select.Root>
                                {validacaoTipoAlternativa && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        Selecione um tipo de questão válido.
                                    </Field.ErrorText>
                                )}
                                {validacaoIdAtividadeMantido && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        O tipo de questão não pode ser alterado durante a edição.
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                        </Stack>
                        <Stack
                            gap="1"
                            h="100%"
                            minH={0}
                            overflow="hidden"

                            opacity={idQuestao ? 0.5 : 1}
                            pointerEvents={idQuestao ? "none" : "auto"}
                            cursor={idQuestao ? "not-allowed" : "pointer"}
                            filter={idQuestao ? "grayscale(40%)" : "none"}
                        >
                            <Text
                                textStyle="bodyTextBold"
                                color="brand.primaryDark"
                            >
                                Missão atividade associada
                                <Em color="brand.secondaryRed">*</Em>
                            </Text>
                            <Box
                                borderRadius="sm"
                                borderWidth="1px"
                                bg="transparent"
                                color="brand.neutral"
                                borderColor="brand.neutral"
                                h="100%"
                                overflow="hidden"
                                display="flex"
                                flexDirection="column"
                            >

                                <Listbox.Root
                                    collection={missoesFiltradasCollection}
                                    value={idAtividade !== -1 ? [idAtividade.toString()] : []}
                                    onValueChange={({ value }) => {
                                        setIdAtividade(Number(value[0]));
                                    }}
                                    disabled={idQuestao ? true : false}
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
                                    <Box
                                        maxH="60"
                                        overflowY="auto"
                                    >
                                        <Listbox.Content>

                                            {missoesFiltradasCollection.items.map((missao) => (
                                                <Listbox.Item
                                                    item={missao}
                                                    key={missao.value}
                                                >
                                                    <Box
                                                        px="3"
                                                        py="2"
                                                        rounded="sm"

                                                        _hover={{
                                                            bg: "#2f9e411f",
                                                            color: "brand.primaryDark",
                                                        }}
                                                        _highlighted={{
                                                            bg: "#2f9e411f",
                                                            color: "brand.primaryDark",
                                                        }}
                                                        {...idAtividade === Number(missao.value) &&
                                                        {
                                                            bg: "brand.secondary",
                                                            color: "brand.primaryLight",
                                                            fontWeight: "600",
                                                        }
                                                        }
                                                    >
                                                        <Listbox.ItemText>
                                                            {missao.label}
                                                        </Listbox.ItemText>
                                                    </Box>
                                                    <Listbox.ItemIndicator />
                                                </Listbox.Item>
                                            ))}

                                            <Listbox.Empty
                                            >
                                                <Box
                                                    px="3"
                                                    py="2"
                                                    rounded="sm"
                                                >
                                                    Nenhuma missão atividade cadastrada
                                                </Box>
                                            </Listbox.Empty>
                                        </Listbox.Content>
                                    </Box>
                                </Listbox.Root>
                            </Box>
                            {validacaoIdAtividade && (
                                <Text
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                    textAlign="end"
                                >
                                    Selecione uma atividade válida.
                                </Text>
                            )}
                            {validacaoTrilhaMantida && (
                                <Text
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                    textAlign="end"
                                >
                                    A atividade não pode ser alterada durante a edição.
                                </Text>
                            )}
                        </Stack>
                    </Grid>
                    <Stack>
                        <Stack
                            direction={{ base: "column", md: "row" }}
                            justifyContent="space-between"
                            mt="5"
                            w="100%"
                        >
                            <Text
                                textStyle="bodyTextBold"
                                color="brand.primaryDark"
                            >
                                Questão
                            </Text>
                            <CustomTooltip
                                content="Exemplo de questão"
                            >
                                <IconButton
                                    aria-label="Exemplo de questão"
                                    variant="ghost"
                                    size="md"
                                    color="brand.primaryDark"
                                    p="3"
                                    onClick={() => setOpenModalAjuda(true)}
                                    disabled={!tipoAlternativa}
                                >
                                    <FaExclamationCircle />
                                </IconButton>
                            </CustomTooltip>
                        </Stack>
                        <Stack
                            mx="5"
                            mt="-1"
                            gap="2"
                        >
                            {(
                                Object.values(TipoAlternativa).includes(tipoAlternativa as TipoAlternativa) ||
                                Object.values(SubtipoAlternativa).includes(tipoAlternativa as SubtipoAlternativa)
                            ) &&
                                <Box
                                    w="100%"
                                    textAlign="justify"
                                    color="brand.neutral"
                                    textStyle="bodyTextLong"
                                >
                                    <Editable.Root
                                        name="enunciado"
                                        value={enunciado}
                                        placeholder="Enunciado da questão"
                                        onValueChange={(e) => setEnunciado(e.value)}
                                    >
                                        <Editable.Preview />
                                        <Editable.Input
                                            size={75}
                                            maxLength={254}
                                        //required
                                        />
                                    </Editable.Root>
                                    {validacaoEnunciado && (
                                        <Text
                                            textAlign="end"
                                            textStyle="inputPlaceholder"
                                            color="brand.secondaryRed"
                                        >
                                            O enunciado é obrigatório e deve ter no máximo 255 caracteres.
                                        </Text>
                                    )}
                                </Box>
                            }
                            <ExibirTipoAlternativa
                                alternativas={alternativas}
                                tipoAlternativa={tipoAlternativa}
                                tipoAtividade={tipoAtividade}
                                setAlternativas={setAlternativas}
                            />
                            {validacaoAlternativas && (
                                <Text
                                    textAlign="end"
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    {tipoAlternativa === TipoAlternativa.ASSOCIACAO
                                        ? "Preencha corretamente todos os pares que devem ser associados."
                                        : tipoAlternativa === TipoAlternativa.ORDENACAO
                                            ? "Preencha todos os itens e verifique se estão na ordem correta."
                                            : tipoAlternativa === SubtipoAlternativa.MULTIPLAS_CORRETAS
                                                ? "Preencha todas as alternativas e defina ao menos 1 resposta correta."
                                                : "Preencha todas as alternativas e defina 1 resposta correta."}
                                </Text>
                            )}
                        </Stack>
                        {(
                            Object.values(TipoAlternativa).includes(tipoAlternativa as TipoAlternativa) ||
                            Object.values(SubtipoAlternativa).includes(tipoAlternativa as SubtipoAlternativa)
                        ) && <Text
                            textStyle="inputPlaceholder"
                            color="brand.secondaryRed"
                            textAlign="end"
                        >
                                * {mensagensAjudaQuestoes[tipoAlternativa as TipoAlternativa | SubtipoAlternativa]}
                            </Text>}
                    </Stack>
                    <Field.Root required invalid={validacaoMensagemCorrecao}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Mensagem de correção
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <Textarea
                            name="mensagemCorrecao"
                            value={mensagemCorrecao}
                            placeholder="Deixe uma mensagem com a correção desta questão"
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
                            onChange={(e) => setMensagemCorrecao(e.target.value)}
                        />
                        {validacaoMensagemCorrecao && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A mensagem de correção é obrigatória e deve ter no máximo 255 caracteres.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="100%"
                        gap="4"
                    >
                        {idQuestao &&
                            <Button
                                flex={1}
                                w="100%"
                                variant="outline"
                                onClick={() => navigate("/banco-questoes")}
                            >
                                Voltar
                            </Button>}
                        {idQuestao &&
                            <Button
                                flex={1}
                                w="100%"
                                variant="danger"
                                onClick={() => setOpenModalExclusao(true)}
                                size="md"
                            >
                                Excluir questão
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
                open={openModalExclusao}
                onOpenChange={(e) => setOpenModalExclusao(e.open)}
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
                                    Excluir questão
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="justify"
                                    pb="4"
                                >
                                    Você está prestes a excluir esta questão. Após a confirmação, ela será removida permanentemente e não poderá ser recuperada.
                                </Text>
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    w="fit-content"
                                    mx="auto"
                                    gap="5"
                                    align="center"
                                >
                                    <Heading textStyle="emphasis" color="brand.primaryDark">
                                        {tipoAlternativaLabel}
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
                                        {enunciado}
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
                                            setOpenModalExclusao(false)
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        flex={1}
                                        w="100%"
                                        variant="danger"
                                        onClick={() => {
                                            setOpenModalExclusao(false)
                                            onExclude()
                                        }}
                                    >
                                        Excluir
                                    </Button>
                                </Stack>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger
                                asChild
                                color="brand.neutral"
                                m="5"
                            >
                                <FaTimes size={20} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Dialog.Root
                size="xl"
                lazyMount
                placement="center"
                open={openModalAjuda}
                onOpenChange={(e) => setOpenModalAjuda(e.open)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title
                                    textStyle="headingMD"
                                    color="brand.primaryDark"
                                    mt="8"
                                >
                                    Exemplo preenchimento de alternativa
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text
                                    textStyle="bodyTextLong"
                                    color="brand.neutral"
                                    textAlign="justify"
                                >
                                    {mensagensAjudaQuestoesModal[tipoAlternativa as TipoAlternativa | SubtipoAlternativa]}
                                </Text>
                                <Box 
                                    mx="-2"
                                    my="-6"
                                    mb="-14"
                                >
                                     <CardCustomizado
                                    titulo=""
                                    mensagem=""
                                    
                                >
                                    <Skeleton
                                        loading={!loadedAjuda}
                                        h="100%"
                                        minH="200px"
                                        maxH="450px"
                                        w="100%"
                                    >
                                        <Image
                                            src={imagemAjuda[tipoAlternativa]}
                                            alt={`Exemplo preenchimento de alternativa ${tipoAlternativa in Object.values(TipoAtividade) ?
                                                TipoAlternativaLabel[tipoAlternativa as TipoAlternativa]
                                                : SubtipoAlternativaLabel[tipoAlternativa as SubtipoAlternativa]
                                                }`}
                                            objectFit="cover"
                                            overflow="hidden"
                                            loading="lazy"
                                            h="100%"
                                            minH="200px"
                                            maxH="450px"
                                            w="100%"
                                            onLoad={() => setLoadedAjuda(true)}
                                        />
                                    </Skeleton>
                                </CardCustomizado>
                                </Box>
                            </Dialog.Body>
                            <Dialog.Footer justifyContent="center">
                                <Button
                                    flex={1}
                                    w="100%"
                                    variant="outline"
                                    onClick={() => {
                                        setOpenModalAjuda(false)
                                    }}
                                >
                                    Voltar
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger
                                asChild
                                color="brand.neutral"
                                m="5"
                            >
                                <FaTimes size={20} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </CardCustomizado >
    );
}

type AlternativasProps = {
    alternativas: Alternativa[]
    tipoAlternativa: string
    tipoAtividade: string
    setAlternativas: (alternativas: Alternativa[]) => void
}

function ExibirTipoAlternativa({
    alternativas,
    tipoAlternativa,
    tipoAtividade,
    setAlternativas,
}: AlternativasProps) {

    function marcarAlternativaMultiplaEscolha(alternativa: AlternativaMultiplaEscolha) {
        const novasAlternativas = [...alternativas] as AlternativaMultiplaEscolha[]

        const index = alternativas.findIndex(a =>
            a.id === alternativa.id
        )
        if (index === -1) return

        const alternativaMultipla = {
            id: alternativa.id,
            texto: alternativa.texto,
            tipoAlternativa: TipoAlternativa.MULTIPLA_ESCOLHA,
            correta: novasAlternativas[index].correta ? false : true,
            subtipo: alternativa.subtipo,
        } as AlternativaMultiplaEscolha

        novasAlternativas[index] = alternativaMultipla
        setAlternativas(novasAlternativas)
    }

    function alterarRespostaAssociacao(colunasAssociadas: colunasAssociadas) {
        const novasAlternativas = [...alternativas] as AlternativaAssociacao[]

        const itemA = colunasAssociadas.colunaA[colunasAssociadas.index!]
        const itemB = colunasAssociadas.colunaB[colunasAssociadas.index!]

        const alternativaAssociacaoNova = {
            id: itemA.id,
            texto: itemA.texto,
            tipoAlternativa: TipoAlternativa.ASSOCIACAO,
            alternativaAssociada: {
                id: itemB.id,
                texto: itemB.texto,
                tipoAlternativa: TipoAlternativa.ASSOCIACAO,
            }
        } as AlternativaAssociacao

        novasAlternativas[colunasAssociadas.index!] = alternativaAssociacaoNova
        setAlternativas(novasAlternativas)
    }

    function alterarRespostaOrdenacao(texto: string, index: number) {
        const novasAlternativas = [...alternativas] as AlternativaOrdenacao[]
        const alternativaAntiga = alternativas[index] as AlternativaOrdenacao
        if (!alternativaAntiga) return

        const alternativaNova = {
            id: alternativaAntiga.id,
            texto: texto,
            tipoAlternativa: TipoAlternativa.ORDENACAO,
            numeroSequencia: alternativaAntiga.numeroSequencia
        } as AlternativaOrdenacao

        novasAlternativas[index] = alternativaNova
        setAlternativas(novasAlternativas)
    }

    switch (tipoAtividade) {
        case TipoAtividade.QUIZ:
            switch (tipoAlternativa) {
                case SubtipoAlternativa.MULTIPLAS_CORRETAS:
                case SubtipoAlternativa.MULTIPLA_ESCOLHA:
                case SubtipoAlternativa.VERDADEIRO_FALSO:
                    return (
                        <MultiplaEscolhaCadastroQuiz
                            alternativas={alternativas}
                            onClick={marcarAlternativaMultiplaEscolha}
                        />
                    )
                case TipoAlternativa.ASSOCIACAO:
                    return (
                        < AssociacaoCadastroQuiz
                            alternativas={alternativas}
                            onChange={alterarRespostaAssociacao}
                        />
                    )
                case TipoAlternativa.ORDENACAO:
                    return (
                        < OrdenacaoCadastroQuiz
                            alternativas={alternativas}
                            onChange={alterarRespostaOrdenacao}
                        />
                    )
                default:
                    return (
                        <Text
                            textAlign="justify"
                            color="brand.secondaryRed"
                            textStyle="bodyTextBold"
                        >
                            Tipo de questão desconhecido.
                        </Text>
                    )
            }

        case TipoAtividade.TAREFA:
            switch (tipoAlternativa) {
                case SubtipoAlternativa.MULTIPLAS_CORRETAS:
                case SubtipoAlternativa.MULTIPLA_ESCOLHA:
                case SubtipoAlternativa.VERDADEIRO_FALSO:
                    return (
                        <MultiplaEscolhaCadastroTarefa
                            alternativas={alternativas}
                            onClick={marcarAlternativaMultiplaEscolha}
                        />
                    )
                case TipoAlternativa.ASSOCIACAO:
                    return (
                        < AssociacaoCadastroTarefa
                            alternativas={alternativas}
                            onChange={alterarRespostaAssociacao}
                        />
                    )
                case TipoAlternativa.ORDENACAO:
                    return (
                        < OrdenacaoCadastroTarefa
                            alternativas={alternativas}
                            onChange={alterarRespostaOrdenacao}
                        />
                    )
                default:
                    return (
                        <Text
                            textAlign="justify"
                            color="brand.secondaryRed"
                            textStyle="bodyTextBold"
                        >
                            Tipo de questão desconhecido.
                        </Text>
                    )
            }

        default:
            return (
                <Text
                    textAlign="justify"
                    color="brand.secondaryRed"
                    textStyle="bodyTextBold"
                >
                    Tipo de atividade desconhecido.
                </Text>
            )
    }
}