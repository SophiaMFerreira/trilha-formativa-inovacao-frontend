import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Button, createListCollection, DatePicker, DateValue, Dialog, DialogFooter, Em, Field, Fieldset, Flex, Grid, InputGroup, Link, List, ListCollection, parseDate, Portal, RadioGroup, ScrollArea, Select, Stack, Text } from "@chakra-ui/react";
import { AvatarUsuario } from "@/components/AvatarUsuario";
import { AppInput } from "@/components/commons/AppInput";
import CardSimples from "@/components/commons/cardCustomizado";

import { Usuario, UsuarioDTO } from "@/types_consts/usuario";
import { OcupacaoDTO } from "@/types_consts/ocupacao";
import { UsuarioAPI } from "../../api/usuario";
import { OcupacaoAPI } from "../../api/ocupacao";
import { urlDaFotoDePerfil } from "@/utils/fotoPerfil";
import { mensagemDeErroDaApi } from "@/utils/erroApi";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/contexts/AuthContext";
import { FaRegCalendarAlt } from "react-icons/fa";
import { validarUsuario } from "@/utils/validations/usuario";
import { informouNovaSenha } from "@/utils/validations/senha";
import { toaster } from "@/components/commons/toaster";
import { mensagensToastErro, mensagensToastSucesso } from "@/config/mensagensToaster";
import { mensagensErroConsole } from "@/config/mensagensError";

export function CadastroAventureiro() {
    const navigate = useNavigate();
    const { user, login, logout, updateUser } = useAuth();

    const editando = Boolean(user)

    const acao = editando ? "Editar meus dados" : "Cadastro de aventureiro "
    const mensagem = editando ? "Altere seus dados cadastrais." : "Faça seu cadastro para uma jornada de aprendizado incrível."
    const [open, setOpen] = useState(false)
    const [openExclusao, setOpenModalExclusao] = useState(false)
    const prosseguir = () => {
        if (aceiteTermos) {
            onSubmit();
        } else {
            window.open(
                "https://padlet.com/ceov/trilha-formativa-para-inovacao-z8blynsyevyi7z4z",
                "_blank"
            );
        }
    };

    const dataAtual = new Intl.DateTimeFormat('en-CA').format(new Date())
    const format = (data: DateValue) => {
        const dia = data.day.toString().padStart(2, "0")
        const mes = data.month.toString().padStart(2, "0")
        const ano = (data.year).toString().padStart(4, "0")
        return `${dia}/${mes}/${ano}`
    }

    const [ocupacoes, setOcupacoes] = useState<OcupacaoDTO[]>([]);
    const [ocupacaoCollection, setOcupacaoCollection] = useState<ListCollection>(createListCollection({
        items: [
            {
                label: "Nenhuma ocupação cadastrada",
                value: "",
            },
        ]
    }));

    const [idUsuario, setIdUsuario] = useState(-1)
    const [nomeUsuario, setNomeUsuario] = useState("")
    const [nomeAventureiro, setNomeAventureiro] = useState("")
    const [correioEletronico, setCorreioEletronico] = useState("")
    const [dataNascimento, setDataNascimento] = useState<DateValue[]>()
    const [possuiConhecimento, setPossuiConhecimento] = useState(false)
    const [idOcupacao, setIdOcupacao] = useState<number>(-1)
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [confirmarSenhaAtual, setConfirmarSenhaAtual] = useState("")

    const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
    /** Pré-visualização local, só depois de o usuário escolher um arquivo. */
    const [previewImagem, setPreviewImagem] = useState<string | undefined>();
    /** Usuário carregado da API, na edição. */
    const [usuarioCarregado, setUsuarioCarregado] = useState<Usuario | null>(null);

    /*
     * A imagem exibida é a pré-visualização, quando existe, ou a foto
     * já cadastrada — derivada do usuário carregado.
     *
     * A versão anterior guardava o caminho da foto em
     * localStorage("fotoPerfil") e montava a URL num segundo useEffect
     * que dependia de idUsuario/fotoPerfilNome, mas usava também
     * nomeAventureiro SEM declará-lo nas dependências. Na primeira
     * execução esses estados ainda valiam -1 e "", então a URL saía
     * inválida e o efeito não rodava de novo quando os dados chegavam:
     * era por isso que a foto só aparecia depois de o usuário
     * selecionar o arquivo outra vez.
     */
    const imagem = previewImagem ?? urlDaFotoDePerfil(usuarioCarregado);

    const [removendoImagem, setRemovendoImagem] = useState(false);

    /**
     * Remove a imagem de perfil.
     *
     * A interface só reflete a remoção depois de o backend confirmar:
     * apaga o arquivo, limpa a referência no banco e devolve
     * fotoPerfil nulo. Assim não sobra no registro um caminho
     * apontando para arquivo que já não existe.
     */
    const onRemoverImagem = async () => {
        if (!user?.id || removendoImagem) return;

        setRemovendoImagem(true);

        try {
            await UsuarioAPI.removerImagemPerfil(Number(user.id));

            /* Descarta também a pré-visualização e o arquivo pendente. */
            setPreviewImagem(anterior => {
                if (anterior?.startsWith("blob:")) {
                    URL.revokeObjectURL(anterior);
                }
                return undefined;
            });
            setArquivoImagem(null);

            setUsuarioCarregado(anterior =>
                anterior ? { ...anterior, fotoPerfil: null } : anterior
            );

            toaster.create(mensagensToastSucesso.removerFotoPerfil);
        } catch (erro) {
            console.error(
                mensagensErroConsole.removerFotoPerfil,
                mensagemDeErroDaApi(erro) ?? erro
            );
            toaster.create(mensagensToastErro.removerFotoPerfil);
        } finally {
            setRemovendoImagem(false);
        }
    };

    const [aceiteTermos, setAceiteTermos] = useState<boolean | null>(null)

    useEffect(() => {
        let ativo = true;

        async function carregarOcupacoes(): Promise<OcupacaoDTO[]> {
            try {
                const ocupacaoResponse = await OcupacaoAPI.listar()

                const ocupacoes = Array.isArray(ocupacaoResponse.data)
                    ? ocupacaoResponse.data as OcupacaoDTO[]
                    : []

                if (!ativo) return ocupacoes

                const ocupacoesCollection = createListCollection({
                    items:
                        ocupacoes.length === 0
                            ? [{
                                label: "Nenhuma ocupação cadastrada",
                                value: "-1",
                            },
                            ]
                            : ocupacoes.map(item => ({
                                label: item.titulo,
                                value: String(item.id),
                            })),
                })
                setOcupacoes(ocupacoes)
                setOcupacaoCollection(ocupacoesCollection)

                return ocupacoes
            } catch (erro) {
                if (ativo) {
                    toaster.create(mensagensToastErro.carregarOcupacoes)
                }
                console.error(
                    mensagensErroConsole.buscarOcupacoes,
                    mensagemDeErroDaApi(erro) ?? erro
                );
                return []
            }
        }

        async function carregarDadosUsuario(listaOcupacoes: OcupacaoDTO[]) {
            try {
                if (!user) return;

                const usuarioResponse = await UsuarioAPI.buscarPorId(Number(user.id))
                if (!usuarioResponse.data) return
                if (!ativo) return

                const usuario = usuarioResponse.data as Usuario

                setUsuarioCarregado(usuario)
                setIdUsuario(usuario.id)
                setNomeUsuario(usuario.nomeUsuario)
                setNomeAventureiro(usuario.nomeAventureiro)
                setCorreioEletronico(usuario.correioEletronico)

                if (usuario.dataNascimento) {
                    setDataNascimento([parseDate(usuario.dataNascimento)])
                }

                setPossuiConhecimento(usuario.possuiConhecimento)

                /*
                 * A condição estava invertida ("ocupacao" in usuario):
                 * o erro era disparado justamente quando a ocupação
                 * VINHA na resposta, e seguia adiante quando ela
                 * faltava.
                 */
                const idOcupacaoUsuario = Number(usuario.ocupacao?.id)

                if (!Number.isInteger(idOcupacaoUsuario) || idOcupacaoUsuario <= 0) {
                    toaster.create(mensagensToastErro.carregarOcupacoes)
                    console.error(
                        mensagensErroConsole.buscarOcupacoes,
                        "Usuário sem ocupação válida:",
                        usuario.ocupacao
                    );
                    return
                }

                /*
                 * O Select casa o valor pelo ID vindo da lista. Se a
                 * ocupação do usuário não estiver entre as opções, o
                 * campo apareceria em branco e a validação recusaria um
                 * valor que está correto no banco — então a opção é
                 * acrescentada à coleção.
                 */
                const ocupacaoNaLista = listaOcupacoes.some(
                    o => Number(o.id) === idOcupacaoUsuario
                )

                if (!ocupacaoNaLista && usuario.ocupacao) {
                    const ocupacoesComAAtual = [...listaOcupacoes, usuario.ocupacao]

                    setOcupacoes(ocupacoesComAAtual)
                    setOcupacaoCollection(createListCollection({
                        items: ocupacoesComAAtual.map(item => ({
                            label: item.titulo,
                            value: String(item.id),
                        })),
                    }))
                }

                setIdOcupacao(idOcupacaoUsuario)

            } catch (erro) {
                if (ativo) {
                    toaster.create(mensagensToastErro.carregarUsuario)
                }
                console.error(
                    mensagensErroConsole.buscarAventureiro,
                    mensagemDeErroDaApi(erro) ?? erro
                );
            }
        }

        /*
         * As ocupações são carregadas ANTES dos dados do usuário: a
         * segunda etapa precisa da lista para conferir se a ocupação
         * gravada está entre as opções do Select. As duas chamadas
         * eram disparadas soltas, sem ordem nem await.
         */
        carregarOcupacoes().then(carregarDadosUsuario)

        return () => { ativo = false };
    }, [user?.id]);

    const [validarNomeUsuario, setValidarNomeUsuario] = useState(false)
    const [validarNomeAventureiro, setValidarNomeAventureiro] = useState(false)
    const [validarCorreioEletronico, setValidarCorreioEletronico] = useState(false)
    const [validarDataNascimento, setValidarDataNascimento] = useState(false)
    const [validarOcupacao, setValidarOcupacao] = useState(false)
    const [validarPossuiConhecimento, setValidarPossuiConhecimento] = useState(false)
    const [validarSenha, setValidarSenha] = useState(false)
    const [validarConfirmarSenha, setValidarConfirmarSenha] = useState(false)
    const [validarSenhaAtual, setValidarSenhaAtual] = useState(false)

    const abrirModal = () => {
        const resultado = validarUsuario({
            idUsuario,
            nomeUsuario,
            nomeAventureiro,
            correioEletronico,
            dataNascimento,
            dataAtual,
            possuiConhecimento,
            ocupacao: idOcupacao,
            listaOcupacoes: ocupacoes,
            senha,
            confirmarSenha,
            confirmarSenhaAtual,
            imagemArquivo: arquivoImagem,
            edicao: idUsuario !== -1 ? true : false
        })

        if (!resultado.valido) {
            setValidarNomeUsuario(resultado.nomeUsuario);
            setValidarNomeAventureiro(resultado.nomeAventureiro);
            setValidarCorreioEletronico(resultado.correioEletronico);
            setValidarDataNascimento(resultado.dataNascimento);
            setValidarOcupacao(resultado.ocupacao);
            setValidarPossuiConhecimento(resultado.possuiConhecimento);
            setValidarSenha(resultado.senha);
            setValidarConfirmarSenha(resultado.confirmarSenha);
            setValidarSenhaAtual(resultado.confirmarSenhaAtual);

            if (!resultado.imagemArquivo) {
                toaster.create(mensagensToastErro.validarImagemArquivo)
            }

            toaster.create(mensagensToastErro.validarAventureiro)
            setOpen(false);
            return;
        }

        setOpen(true);
    };

    const onSubmit = async () => {
        const resultado = validarUsuario({
            idUsuario,
            nomeUsuario,
            nomeAventureiro,
            correioEletronico,
            dataNascimento,
            dataAtual,
            possuiConhecimento,
            ocupacao: idOcupacao,
            listaOcupacoes: ocupacoes,
            senha,
            confirmarSenha,
            confirmarSenhaAtual,
            imagemArquivo: arquivoImagem,
            edicao: idUsuario !== -1 ? true : false
        })

        if (!resultado.valido) {
            setValidarNomeUsuario(resultado.nomeUsuario);
            setValidarNomeAventureiro(resultado.nomeAventureiro);
            setValidarCorreioEletronico(resultado.correioEletronico);
            setValidarDataNascimento(resultado.dataNascimento);
            setValidarOcupacao(resultado.ocupacao);
            setValidarPossuiConhecimento(resultado.possuiConhecimento);
            setValidarSenha(resultado.senha);
            setValidarConfirmarSenha(resultado.confirmarSenha);
            setValidarSenhaAtual(resultado.confirmarSenhaAtual);

            if (!resultado.imagemArquivo) {
                toaster.create(mensagensToastErro.validarImagemArquivo)
            }

            toaster.create(mensagensToastErro.validarAventureiro)
            setOpen(false);
            return;
        }

        /* Trocar a senha é opcional na edição: só vale se ele digitou. */
        const alterarSenha = informouNovaSenha(senha, confirmarSenha)

        try {
            if (user?.id) {
                const usuarioPayload = {
                    nomeUsuario: nomeUsuario,
                    nomeAventureiro: nomeAventureiro,
                    correioEletronico: correioEletronico,
                    ...(dataNascimento && { dataNascimento: `${dataNascimento[0].year}-${String(dataNascimento[0].month).padStart(2, "0")}-${String(dataNascimento[0].day).padStart(2, "0")}` }),
                    possuiConhecimento: possuiConhecimento,
                    primeiroAcesso: !editando,
                    /*
                     * A nova senha vai no payload SOMENTE quando o
                     * usuário digitou uma. Antes, quando ele não queria
                     * trocar, a tela mandava a senha ATUAL em claro no
                     * campo de nova senha e o backend gerava um hash
                     * novo para a mesma senha — além de tornar
                     * impossível editar qualquer dado sem redigitar
                     * uma senha completa.
                     */
                    ...(alterarSenha && {
                        novaSenha: senha,
                        novaSenhaRepeticao: confirmarSenha,
                    }),
                    senhaAtual: confirmarSenhaAtual,
                    idOcupacao: idOcupacao,
                } as UsuarioDTO

                const responseEdicao = await UsuarioAPI.atualizar(idUsuario, usuarioPayload);
                if (!responseEdicao.data) {
                    toaster.create(mensagensToastErro.editarAventureiro)
                    return
                }

                const novoUser: User = {
                    id: idUsuario,
                    nomeAventureiro: nomeAventureiro,
                    role: "usuario",
                }

                if (arquivoImagem) {
                    const formData = new FormData();
                    formData.append("foto", arquivoImagem);

                    await UsuarioAPI.salvarImagemPerfil(idUsuario, formData);
                }

                updateUser(novoUser)
                toaster.create(mensagensToastSucesso.editarAventureiro)
            } else {
                const usuarioPayload = {
                    nomeUsuario: nomeUsuario,
                    nomeAventureiro: nomeAventureiro,
                    correioEletronico: correioEletronico,
                    ...(dataNascimento && { dataNascimento: `${dataNascimento[0].year}-${String(dataNascimento[0].month).padStart(2, "0")}-${String(dataNascimento[0].day).padStart(2, "0")}` }),
                    possuiConhecimento: possuiConhecimento,
                    primeiroAcesso: !editando,
                    senha: senha,
                    senhaRepeticao: confirmarSenha,
                    idOcupacao: idOcupacao,
                    ...(idUsuario !== -1 && { id: idUsuario }),
                } as UsuarioDTO

                const responseCadastro = await UsuarioAPI.salvar(usuarioPayload);
                if (!responseCadastro.data) {
                    toaster.create(mensagensToastErro.salvarAventureiro)
                    return
                }

                const responseLogin = await login(usuarioPayload.correioEletronico, senha)
                if (!responseLogin) {
                    console.error("Usuário cadastrado com sucesso, mas não foi possível realizar o login.");
                    navigate("/login");
                    return
                }

                if (arquivoImagem) {
                    const formData = new FormData();
                    formData.append("foto", arquivoImagem);

                    await UsuarioAPI.salvarImagemPerfil(responseLogin.id, formData);
                }

                toaster.create(mensagensToastSucesso.salvarAventureiro)
            }

            navigate("/trilhaFormativaInovacao");
        } catch (erro) {
            /*
             * O erro só ia para o console: a tela ficava parada, sem
             * navegar e sem dizer nada ao usuário.
             */
            console.error(
                user?.id
                    ? mensagensErroConsole.editarAventureiro
                    : mensagensErroConsole.salvarAventureiro,
                mensagemDeErroDaApi(erro) ?? erro
            );

            toaster.create(
                user?.id
                    ? mensagensToastErro.editarAventureiro
                    : mensagensToastErro.salvarAventureiro
            )
        }
    }

    const onExclude = async () => {
        try {
            if (!user) return

            /*
             * A exclusão precisa terminar antes do logout e da
             * navegação: sem o await, a requisição saía com o token
             * prestes a ser apagado e a conta podia continuar de pé.
             */
            await UsuarioAPI.deletar(idUsuario)

            toaster.create(mensagensToastSucesso.excluirUsuario)
            logout()
            navigate("/");
        } catch (erro) {
            console.error(
                mensagensErroConsole.excluirAventureiro,
                mensagemDeErroDaApi(erro) ?? erro
            );
            toaster.create(mensagensToastErro.excluirUsuario)
        }
    }

    return (
        <CardSimples
            titulo={acao}
            mensagem={mensagem}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}>
                <Stack
                    gap="5"
                    mt={6}
                >
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            lg: "1fr 180px",
                        }}
                        gap="8"
                        alignItems="start"
                    >
                        <Stack gap="5">
                            <Field.Root required invalid={validarNomeUsuario}>
                                <Field.Label
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                >
                                    Nome
                                    <Field.RequiredIndicator color="brand.secondaryRed" />
                                </Field.Label>
                                <InputGroup>
                                    <AppInput
                                        name="nomeUsuario"
                                        value={nomeUsuario}
                                        placeholder="Nome Completo"
                                        size="md"
                                        onChange={(e) => setNomeUsuario(e.target.value)}
                                    />
                                </InputGroup>
                                {validarNomeUsuario && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        O nome completo é obrigatório e deve ter no máximo 255 caracteres.
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                            <Field.Root required invalid={validarNomeAventureiro}>
                                <Field.Label
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                >
                                    Nome de aventureiro
                                    <Field.RequiredIndicator color="brand.secondaryRed" />
                                </Field.Label>
                                <InputGroup>
                                    <AppInput
                                        name="nomeAventureiro"
                                        value={nomeAventureiro}
                                        placeholder="Escolha um nome de aventureiro"
                                        size="md"
                                        onChange={(e) => setNomeAventureiro(e.target.value)}
                                    />
                                </InputGroup>
                                {validarNomeAventureiro && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        O nome de aventureiro é obrigatório e deve ter no máximo 255 caracteres.
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                        </Stack>
                        <Flex
                            justify="center"
                            pt="2"
                        >
                            <AvatarUsuario
                                imagem={imagem}
                                onChange={(file, preview) => {
                                    setArquivoImagem(file);

                                    /*
                                     * Libera a URL da pré-visualização
                                     * anterior: cada createObjectURL
                                     * segura o arquivo em memória até
                                     * ser revogado.
                                     */
                                    setPreviewImagem(anterior => {
                                        if (anterior?.startsWith("blob:")) {
                                            URL.revokeObjectURL(anterior);
                                        }
                                        return preview;
                                    });
                                }}
                                onRemover={editando ? onRemoverImagem : undefined}
                                removendo={removendoImagem}
                            />
                        </Flex>
                    </Grid>
                    <Field.Root invalid={validarDataNascimento}>
                        <DatePicker.Root
                            value={dataNascimento}
                            onValueChange={(e) => setDataNascimento(e.value)}
                            format={format}
                            locale="pt-BR"
                            min={parseDate("1826-01-01")}
                            max={parseDate(dataAtual.toString())}
                            placeholder="dd/mm/aaaa"
                        >
                            <DatePicker.Label
                                textStyle="emphasis"
                                color="brand.primaryDark"
                            >
                                Data de Nascimento
                            </DatePicker.Label>
                            <DatePicker.Control
                                textStyle="bodyText"
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
                            >
                                <DatePicker.Trigger asChild unstyled>
                                    <Button
                                        variant="ghost"
                                        width="full"
                                        justifyContent="flex-start"
                                        color="brand.neutral"
                                    >
                                        <DatePicker.ValueText
                                            placeholder="dd/mm/aaaa"
                                            color="brand.neutral"
                                        />
                                    </Button>
                                </DatePicker.Trigger>
                                <DatePicker.IndicatorGroup>
                                    <DatePicker.Trigger
                                        color="brand.primaryDark"
                                    >
                                        <FaRegCalendarAlt color="brand.primaryDark" />
                                    </DatePicker.Trigger>
                                </DatePicker.IndicatorGroup>
                            </DatePicker.Control>
                            <Portal>
                                <DatePicker.Positioner>
                                    <DatePicker.Content
                                        color="brand.neutral"
                                        textStyle="bodyText"
                                    >
                                        <DatePicker.View view="day">
                                            <DatePicker.Header
                                                color="brand.primaryDark"
                                                textStyle="bodyTextBold"
                                            />
                                            <DatePicker.DayTable
                                                _selected={{
                                                    color: "brand.white",
                                                    bg: "brand.primaryDark",
                                                }}
                                            />
                                        </DatePicker.View>
                                        <DatePicker.View view="month">
                                            <DatePicker.Header
                                                color="brand.primaryDark"
                                                textStyle="bodyTextBold"
                                            />
                                            <DatePicker.MonthTable />
                                        </DatePicker.View>
                                        <DatePicker.View view="year">
                                            <DatePicker.Header
                                                color="brand.primaryDark"
                                                textStyle="bodyTextBold"
                                            />
                                            <DatePicker.YearTable />
                                        </DatePicker.View>
                                    </DatePicker.Content>
                                </DatePicker.Positioner>
                            </Portal>
                        </DatePicker.Root>
                        {validarDataNascimento && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A data não pode ser igual ou posterior a data de hoje. Informe uma data de nascimento válida.
                                {validarDataNascimento}
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Field.Root required invalid={validarCorreioEletronico}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            Email
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="correioEletronico"
                                type="email"
                                value={correioEletronico}
                                placeholder="alunoInovacoes@gmail.com"
                                size="md"
                                onChange={(e) => setCorreioEletronico(e.target.value)}
                            />
                        </InputGroup>
                        {validarCorreioEletronico && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                Informe um endereço de e-mail válido.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
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
                            invalid={validarOcupacao}
                            disabled={ocupacoes?.length === 0}
                        >
                            <Select.Root
                                collection={ocupacaoCollection}
                                disabled={ocupacoes?.length === 0}
                                name="ocupacao"
                                value={idOcupacao !== -1 ? [String(idOcupacao)] : []}
                                onValueChange={(details) => {
                                    setIdOcupacao(Number(details.value[0]));
                                }}
                                size="md"
                                maxW="md"
                            >
                                <Select.HiddenSelect />
                                <Select.Label
                                    textStyle="bodyTextBold"
                                    color="brand.primaryDark"
                                >
                                    Ocupação
                                    <Em color="brand.secondaryRed">*</Em>
                                </Select.Label>
                                <Select.Control>
                                    <Select.Trigger
                                        borderWidth="1px"
                                        borderColor="brand.neutral"
                                        borderRadius="sm"
                                        bg="brand.white"
                                    >
                                        <Select.ValueText
                                            placeholder="Selecionar ocupação"
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
                                            {ocupacaoCollection.items.map((ocupacao) => (
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

                                                    item={ocupacao.value}
                                                    key={ocupacao.value}
                                                >
                                                    {ocupacao.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                            {validarOcupacao && (
                                <Field.ErrorText
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    Selecione uma ocupação.
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                        <Fieldset.Root invalid={validarPossuiConhecimento}>
                            <Fieldset.Legend
                                textStyle="bodyTextBold"
                                color="brand.primaryDark"
                            >
                                Possui conhecimento em Inovação?
                                <Em color="brand.secondaryRed">*</Em>
                            </Fieldset.Legend>
                            <RadioGroup.Root
                                name="possuiConhecimento"
                                value={possuiConhecimento ? "Sim" : "Não"}
                                onValueChange={(details) => {
                                    setPossuiConhecimento(details.value === "Sim");
                                }}
                                ml="8"
                                size="sm"
                                my="1"
                            >
                                <Stack gap="1.5">
                                    <RadioGroup.Item
                                        key="nao"
                                        value="Não"
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
                                            Não
                                        </RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                    <RadioGroup.Item
                                        key="sim"
                                        value="Sim"
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
                                            Sim
                                        </RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                </Stack>
                            </RadioGroup.Root>
                            {validarPossuiConhecimento && (
                                <Fieldset.ErrorText
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    Informe se possui ou não conhecimento em inovação.
                                </Fieldset.ErrorText>
                            )}
                        </Fieldset.Root>
                    </Stack>
                    {user &&
                        <Field.Root required invalid={validarSenhaAtual}>
                            <Field.Label
                                textStyle="emphasis"
                                color="brand.primaryDark"
                            >
                                Confirmar senha atual
                                <Field.RequiredIndicator color="brand.secondaryRed" />
                            </Field.Label>
                            <InputGroup>
                                <AppInput
                                    name="senha"
                                    value={confirmarSenhaAtual}
                                    type="password"
                                    placeholder="*************"
                                    size="md"
                                    onChange={(e) => setConfirmarSenhaAtual(e.target.value)}
                                />
                            </InputGroup>
                            {validarSenhaAtual && (
                                <Field.ErrorText
                                    textStyle="inputPlaceholder"
                                    color="brand.secondaryRed"
                                >
                                    Informe sua senha atual para continuar a edição.
                                </Field.ErrorText>
                            )}
                        </Field.Root>
                    }
                    <Field.Root required={!user} invalid={validarSenha}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            {user ? "Nova senha" : "Senha"}
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="senha"
                                value={senha}
                                type="password"
                                placeholder="*************"
                                size="md"
                                onChange={(e) => setSenha(e.target.value)}
                            />
                        </InputGroup>
                        {validarSenha && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A senha deve ter no mínimo 8 caracteres, incluindo letra, número e caractere especial.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    <Field.Root required={!user} invalid={validarConfirmarSenha}>
                        <Field.Label
                            textStyle="emphasis"
                            color="brand.primaryDark"
                        >
                            {user ? "Confirmar nova senha" : "Confirmar senha"}
                            <Field.RequiredIndicator color="brand.secondaryRed" />
                        </Field.Label>
                        <InputGroup>
                            <AppInput
                                name="confirmarSenha"
                                value={confirmarSenha}
                                type="password"
                                placeholder="*************"
                                size="md"
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                            />
                        </InputGroup>
                        {validarConfirmarSenha && (
                            <Field.ErrorText
                                textStyle="inputPlaceholder"
                                color="brand.secondaryRed"
                            >
                                A confirmação de senha deve ser igual à senha informada.
                            </Field.ErrorText>
                        )}
                    </Field.Root>
                    {user &&
                        <Stack
                            direction={{ base: "column", md: "row" }}
                            w="100%"
                            gap="4"
                            mt="3"
                        >
                            <Button
                                flex={1}
                                w="100%"
                                variant="outline"
                                onClick={() => (
                                    user ? navigate("/dadosAventureiro")
                                        : navigate("/")
                                )}
                                size="md"
                            >
                                Voltar
                            </Button>
                            <Button
                                flex={1}
                                w="100%"
                                variant="danger"
                                onClick={() => setOpenModalExclusao(true)}
                                size="md"
                            >
                                Excluir minha conta
                            </Button>
                            <Button
                                flex={1}
                                w="100%"
                                variant="solid"
                                type="submit"
                                size="md"
                            >
                                Confirmar edição
                            </Button>
                        </Stack>
                    }
                    {!user && (
                        <Box>
                            <Button
                                flex={1}
                                w="100%"
                                variant="solid"
                                size="md"
                                onClick={abrirModal}
                            >
                                Iniciar trilha
                            </Button>
                            <Text
                                textStyle="bodyText"
                                textAlign="center"
                                mt="3"
                            >
                                Já tem uma conta?{" "}
                                <Link
                                    href="/login"
                                    variant="underline"
                                    color="brand.link"
                                    _hover={{
                                        color: "brand.primaryDark",
                                        textDecoration: "none",
                                    }}

                                >
                                    Fazer login
                                </Link>
                            </Text>
                        </Box>
                    )}
                </Stack>
            </form>

            {/* Modal termos uso */}
            <Dialog.Root
                size="xl"
                lazyMount
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                placement="center"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title
                                    textStyle="headingXL"
                                    color="brand.primaryDark"
                                    pt="4"
                                >
                                    Termos de uso e condições
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack
                                    gap="4"
                                >
                                    <Text
                                        textStyle="bodyText"
                                        color="brand.neutral"
                                    >
                                        Leia atentamente antes de continuar.
                                    </Text>
                                    <ScrollArea.Root maxH="56" variant="always">
                                        <ScrollArea.Viewport>
                                            <ScrollArea.Content
                                                paddingEnd="3"
                                                textStyle="sm"
                                                color="brand.neutral"
                                            >
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    1. Aceitação dos Termos
                                                </Text>
                                                <Text
                                                    textStyle="bodyTextLong"
                                                >
                                                    Ao criar uma conta e utilizar o Sistema Web Gamificado para Trilha Formativa em Inovação, você declara estar ciente e de acordo com os presentes Termos de Uso. Caso não concorde com qualquer condição aqui descrita, recomendamos que não utilize a plataforma.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    1. Aceitação dos Termos
                                                </Text>
                                                <Text
                                                    textStyle="bodyTextLong"
                                                >
                                                    Ao criar uma conta e utilizar o Sistema Web Gamificado para Trilha Formativa em Inovação, você declara estar ciente e de acordo com os presentes Termos de Uso. Caso não concorde com qualquer condição aqui descrita, recomendamos que não utilize a plataforma.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    2. Sobre a Plataforma
                                                </Text>
                                                <Text
                                                    textStyle="bodyTextLong"
                                                >
                                                    O Sistema Web Gamificado para Trilha Formativa em Inovação é um projeto desenvolvido com fins educacionais, destinado a apoiar o aprendizado em temas relacionados à inovação, transferência de tecnologia, propriedade intelectual e ambientes promotores de inovação.
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    A plataforma utiliza elementos de gamificação para tornar a experiência de aprendizagem mais dinâmica e interativa, oferecendo conteúdos, missões, desafios, pontuações e distintivos ao longo da jornada do usuário.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    3. Cadastro do Usuário
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Para utilizar a plataforma, é necessário realizar um cadastro informando:
                                                </Text>
                                                <List.Root
                                                    as="ul"
                                                    ml="10"
                                                    textStyle="bodyTextLong"
                                                >
                                                    <List.Item>
                                                        Nome completo;
                                                    </List.Item>
                                                    <List.Item>
                                                        E-mail;
                                                    </List.Item>
                                                    <List.Item>
                                                        Data de nascimento;
                                                    </List.Item>
                                                    <List.Item>
                                                        Ocupação.
                                                    </List.Item>
                                                    <Text>
                                                        Além disso, o usuário poderá, de forma opcional, adicionar uma imagem de perfil e escolher um Nome Aventureiro (nickname) para sua identificação na plataforma.
                                                    </Text>
                                                    <Text>
                                                        O usuário é responsável pela veracidade das informações fornecidas.
                                                    </Text>
                                                </List.Root>
                                                <Text textStyle="bodyTextLong">
                                                    Ao criar uma conta e utilizar o Sistema Web Gamificado para Trilha Formativa em Inovação, você declara estar ciente e de acordo com os presentes Termos de Uso. Caso não concorde com qualquer condição aqui descrita, recomendamos que não utilize a plataforma.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    4. Tratamento de Dados Pessoais
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Os dados coletados são utilizados exclusivamente para:
                                                </Text>
                                                <List.Root
                                                    as="ul"
                                                    ml="10"
                                                    textStyle="bodyTextLong"
                                                >
                                                    <List.Item>
                                                        permitir o acesso à plataforma;
                                                    </List.Item>
                                                    <List.Item>
                                                        identificar o usuário;
                                                    </List.Item>
                                                    <List.Item>
                                                        personalizar sua experiência;
                                                    </List.Item>
                                                    <List.Item>
                                                        acompanhar seu progresso nas atividades;
                                                    </List.Item>
                                                    <List.Item>
                                                        disponibilizar funcionalidades de gamificação;
                                                    </List.Item>
                                                    <List.Item>
                                                        realizar pesquisas e análises relacionadas ao projeto.
                                                    </List.Item>
                                                </List.Root>
                                                <Text>
                                                    O tratamento das informações observa os princípios previstos na Lei Geral de Proteção de Dados Pessoais (LGPD).
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    5. Ranking
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Nesse ranking serão exibidos apenas:
                                                </Text>
                                                <List.Root
                                                    as="ul"
                                                    ml="10"
                                                    textStyle="bodyTextLong"
                                                >
                                                    <List.Item>
                                                        Nome Aventureiro (nickname);
                                                    </List.Item>
                                                    <List.Item>
                                                        Pontuação;
                                                    </List.Item>
                                                    <List.Item>
                                                        Posição no ranking;
                                                    </List.Item>
                                                </List.Root>
                                                <Text>
                                                    Nenhum dado pessoal, como nome completo, e-mail, data de nascimento ou ocupação, será exibido publicamente nessa funcionalidade.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    6. Imagem de Perfil
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    O envio de uma imagem de perfil é opcional.
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Caso o usuário escolha adicionar uma imagem, ela será utilizada apenas para fins de identificação dentro da plataforma.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    7. Direitos do Usuário
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Nos termos da LGPD, o usuário poderá solicitar, quando aplicável:
                                                </Text>
                                                <List.Root
                                                    as="ul"
                                                    ml="10"
                                                    textStyle="bodyTextLong"
                                                >
                                                    <List.Item>
                                                        acesso aos seus dados;
                                                    </List.Item>
                                                    <List.Item>
                                                        atualização ou correção das informações;
                                                    </List.Item>
                                                    <List.Item>
                                                        exclusão da conta e dos dados pessoais armazenados.
                                                    </List.Item>
                                                </List.Root>
                                                <Text>
                                                    A exclusão da conta implica a remoção permanente do progresso realizado na plataforma, incluindo pontuações, distintivos e demais informações relacionadas à participação do usuário.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    8. Responsabilidades
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    O usuário compromete-se a utilizar a plataforma de forma ética e respeitosa, abstendo-se de realizar ações que possam comprometer seu funcionamento ou prejudicar outros participantes.
                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    9. Alterações dos Termos
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Os dados coletados são utilizados exclusivamente para:

                                                </Text>
                                                <Text
                                                    textStyle="emphasis"
                                                >
                                                    10. Contato
                                                </Text>
                                                <Text textStyle="bodyTextLong">
                                                    Em caso de dúvidas sobre estes Termos de Uso ou sobre o tratamento de dados pessoais, entre em contato com a equipe responsável pelo projeto por meio dos canais oficiais disponibilizados pela plataforma do Instituto Federal Sudeste de Minas Gerais.
                                                </Text>
                                                <Text
                                                    textStyle="bodyTextLong"
                                                >
                                                    Última atualização: Agosto de 2026
                                                </Text>
                                            </ScrollArea.Content>
                                        </ScrollArea.Viewport>
                                        <ScrollArea.Scrollbar />
                                    </ScrollArea.Root>
                                    <Text
                                        textStyle="bodyText"
                                        color="brand.neutral"
                                    >
                                        Ao clicar em “Aceito os Termos”, você confirma que leu, compreendeu e concorda com todas as condições apresentadas neste documento. Caso não concorde, selecione “Não Aceito” para continuar a trilha pelo Padlet.
                                    </Text>
                                    <RadioGroup.Root
                                        name="aceiteTermos"
                                        value={String(aceiteTermos)}
                                        onValueChange={(details) => {
                                            setAceiteTermos(details.value === "true");
                                        }}
                                        ml="8"
                                        size="sm"
                                        my="1"
                                    >
                                        <Stack gap="1.5">
                                            <RadioGroup.Item
                                                key="sim"
                                                value="true"
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
                                                    Aceito os termos e condições
                                                </RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                            <RadioGroup.Item
                                                key="nao"
                                                value="false"
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
                                                    Não aceito os termos, e concordo em fazer a trilha pelo Padlet
                                                </RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                        </Stack>
                                    </RadioGroup.Root>
                                    {aceiteTermos === null && (
                                        <Text
                                            textStyle="inputPlaceholder"
                                            color="brand.secondaryRed"
                                        >
                                            Por favor, responda aos termos de uso
                                        </Text>
                                    )}
                                </Stack>
                            </Dialog.Body>
                            <DialogFooter>
                                <Button
                                    flex={1}
                                    w="100%"
                                    variant="solid"
                                    onClick={() => prosseguir()}
                                    size="sm"
                                    disabled={aceiteTermos === null}
                                >
                                    Prosseguir jornada
                                </Button>
                            </DialogFooter>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Modal confirmação exclusao */}
            <Dialog.Root
                size="md"
                lazyMount
                placement="center"
                open={openExclusao}
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
                                    Excluir minha conta
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text
                                    textStyle="bodyText"
                                    color="brand.neutral"
                                    textAlign="justify"
                                    pb="4"
                                >
                                    Deseja realmente excluir esta conta? O progresso atual do usuário e todas as informações associadas serão perdidos permanentemente. Esta ação não pode ser desfeita.
                                </Text>
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
                                        Excluir conta
                                    </Button>
                                </Stack>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </CardSimples >
    );
}