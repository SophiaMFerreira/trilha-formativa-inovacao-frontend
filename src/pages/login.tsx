import { Box, Button, Card, Field, Flex, Heading, Image, InputGroup, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";

import trilhaFormativa from "@/assets/images/Regional.jpg"
import logoIFSudesteHorizontal from "@/assets/logo/logoIFSudeste_horizontalCompacta.svg"
import logoIFSudesteVertival from "@/assets/logo/logoIFSudeste_vertical.svg"
import { useState } from "react";
import { AppInput } from "@/components/commons/AppInput";
import { useAuth } from "@/hooks/useAuth";
import { validarLogin } from "@/utils/validations/login";

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loaded, setLoaded] = useState(false)

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    const [valido, setValido] = useState(false)

    const onSubmit = async () => {
        const valido = validarLogin({ email, senha })
        if (valido) {
            setValido(true)
            return
        }
        try {
            const usuarioLogado = await login(email, senha)
            if (!usuarioLogado) {
                setValido(true)
                return
            }

            if (usuarioLogado.role === "admin") {
                navigate("/banco-materiais");
            } else {
                navigate("/trilhaFormativaInovacao");
            }
        } catch (e) {
            console.error(e)
            //MENSAGEM ERRO
        }
    }

    return (
        <SimpleGrid
            columns={{
                base: 1,
                md: 2,
            }}
            gap={0}
            _after={{
                bg: "brand.500",
                opacity: 0.25,
                pos: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: -1,
                content: '" "',
            }}
            h="100vh"
        >
            <Box>
                <Skeleton
                    loading={!loaded}
                    rounded="0"
                >
                    <Image
                        src={trilhaFormativa}
                        alt="Mapa da trilha Formativa em Inovações"
                        objectFit="cover"
                        h="100vh"
                        loading="lazy"
                        onLoad={() => setLoaded(true)}
                    />
                </Skeleton>
            </Box>
            <Flex
                direction="column"
                alignItems="start"
                justifyContent="center"
                px={{
                    base: 4,
                    lg: 20,
                }}
                py={10}
                gap={8}
            >
                <Link
                    asChild
                    _hover={{
                        textDecoration: "none",
                    }}
                >
                    <NavLink to="/">
                        <Box
                            display={{
                                base: "none",
                                sm: "flex",
                            }}
                            alignItems="center"
                            flexShrink={0}
                            minW="220px"
                        >
                            <img
                                src={logoIFSudesteHorizontal}
                                alt="Instituto Federal Sudeste MG"
                                style={{
                                    height: "64px",
                                    width: "auto",
                                    display: "block",
                                    objectFit: "contain",
                                }}
                            />
                        </Box>
                        <Box
                            display={{
                                base: "flex",
                                sm: "none",
                            }}
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                            minW="60px"
                        >
                            <img
                                src={logoIFSudesteVertival}
                                alt="Instituto Federal Sudeste MG"
                                style={{
                                    height: "80px",
                                    width: "auto",
                                    minHeight: "80px",
                                    display: "block",
                                    objectFit: "contain",
                                }}
                            />
                        </Box>
                    </NavLink>
                </Link>
                <Box
                    w="100%"
                    gap={4}
                >
                    <Heading
                        mb={3}
                        color="brand.primaryDark"
                        textStyle="headingXL"
                    >
                        Login
                    </Heading>
                    <Text
                        textStyle="bodyText"
                        color="brand.neutral"
                        textAlign="left"
                    >
                        Faça login com os dados inseridos durante seu cadastro.
                    </Text>
                </Box>
                <Stack
                    w="100%"
                    gap="3"
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}>
                        <Stack
                            w="100%"
                            gap="4"
                        >
                            <Field.Root invalid={valido}>
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
                                        value={email}
                                        placeholder="alunoInovacoes@gmail.com"
                                        size="md"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </InputGroup>
                            </Field.Root>
                            <Field.Root invalid={valido}>
                                <Field.Label
                                    textStyle="emphasis"
                                    color="brand.primaryDark"
                                >
                                    Senha
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
                                {valido && (
                                    <Field.ErrorText
                                        textStyle="inputPlaceholder"
                                        color="brand.secondaryRed"
                                    >
                                        Login e/ou senha inválidos
                                    </Field.ErrorText>
                                )}
                            </Field.Root>
                            <Button
                                flex={1}
                                w="100%"
                                variant="solid"
                                type="submit"
                                size="sm"
                            >
                                Login
                            </Button>
                        </Stack>
                    </form>
                    <Text
                        textStyle="bodyText"
                        textAlign="right"
                    >
                        Você esqueceu a sua senha?{" "}
                        <Link
                            href="/recuperarSenha"
                            variant="underline"
                            color="brand.link"
                            _hover={{
                                color: "brand.primaryDark",
                                textDecoration: "none",
                            }}

                        >
                            Recupere sua senha aqui
                        </Link>
                    </Text>
                </Stack>
                <Card.Root
                    px="3"
                    py="1"
                    w="100%"
                    maxW="500px"
                    borderWidth="2px"
                    borderColor="brand.primaryDark"
                    rounded="md"
                    bg="brand.white"
                    mt="3"
                    alignSelf="center"
                >
                    <Card.Header>
                        <Heading
                            textStyle="headingXS"
                            color="brand.primaryDark"
                        >
                            Cadastrar-se
                        </Heading>
                    </Card.Header>
                    <Card.Body
                        textStyle="bodyText"
                        color="brand.neutral"
                        py="4"
                    >
                        <Text
                            textStyle="bodyText"
                            color="brand.neutral">
                            Cadastre-se e aproveite a jornada.
                        </Text>
                        <Button
                            flex={1}
                            w="100%"
                            variant="outline"
                            type="submit"
                            size="sm"
                            onClick={() => navigate("/cadastroAventureiro")}
                            mt="3"
                        >
                            Criar conta
                        </Button>
                    </Card.Body>
                </Card.Root>
            </Flex >
        </SimpleGrid >
    );
}