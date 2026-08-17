import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Button, Card, Carousel, Center, Em, Grid, Heading, IconButton, Image, Link, Skeleton, Stack, Text } from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight, FaExternalLinkAlt, FaGamepad } from "react-icons/fa";

import { carrosselConteudo } from "@/config/carrosselConfig";
import CustomTooltip from "@/components/commons/customTooltip";
import trilhaFormativa from "@/assets/images/Regional.jpg"

export default function LandingPage() {
    const navigate = useNavigate();

    const [loaded, setLoaded] = useState(false)
    const [loadedGamificacao, setLoadedGamificacao] = useState(false)

    return (
        <Box
            //minH="calc(100vh - 88px)"
            overflowY="auto"
            scrollSnapType="y mandatory"
        >
            <Stack
                w="100%"
                mx="auto"
                maxW="5xl"
                px="4"
                maxH="calc(100vh - 88px)"
            >
                <Box
                    //minH="calc(100vh - 88px)"
                    position="relative"
                    id="hero"
                    mt="-7"
                    scrollSnapAlign="start"
                >
                    <Skeleton
                        loading={!loaded}
                        w="100%"
                        mb="8"
                        h="80"
                    >
                        <Image
                            src={trilhaFormativa}
                            alt="Trilha Formativa em Inovações"
                            w="100%"
                            h="80"
                            objectFit="cover"
                            onLoad={() => setLoaded(true)}
                        />
                    </Skeleton>
                    <Box>
                        <Heading
                            textAlign="left"
                            color="brand.primaryDark"
                            textStyle="headingXL"
                        >
                            Transforme conhecimento em
                            <Em
                                fontStyle="normal"
                                fontFamily="body"
                                fontSize="42px"
                                lineHeight="46px"
                                fontWeight="700"

                                color="brand.primaryLight"
                                style={{
                                    WebkitTextStroke: "1px var(--chakra-colors-brand-neutral)",
                                }}
                                ml="4"
                            >
                                INOVAÇÃO
                            </Em>
                        </Heading>
                        <Heading
                            textAlign="right"
                            color="brand.primaryDark"
                            textStyle="headingXL"
                        >
                            explorando a Trilha Formativa para Inovação!
                        </Heading>
                    </Box>
                    <Text
                        my="8"
                        mx="40"
                        textStyle="bodyText"
                        color="brand.neutral"
                        textAlign="center"
                    >
                        Avance no seu ritmo, aprenda de forma leve e evolua sua compreensão sobre um dos processos mais estratégicos da inovação moderna.
                    </Text>
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        w="auto"
                        mx="48"
                        gap="4"
                        mb="8"
                    >
                        <Button
                            flex={1}
                            w="100%"
                            variant="outline"
                            onClick={() => navigate("/login")}
                        >
                            Entrar
                        </Button>
                        <Button
                            flex={1}
                            w="100%"
                            variant="solid"
                            type="submit"
                            onClick={() => navigate("/cadastroAventureiro")}
                        >
                            Começar Jornada
                        </Button>
                    </Stack>
                </Box>
                <Box
                    //minH="calc(100vh - 88px)"
                    position="relative"
                    id="carousel"
                    scrollSnapAlign="start"
                >
                    <Heading
                        textAlign="left"
                        color="brand.primaryDark"
                        textStyle="headingMD"
                        my="5"
                    >
                        Uma jornada incrível repleta de
                    </Heading>
                    <Carousel.Root
                        slideCount={carrosselConteudo.length}
                        slidesPerPage={4}
                        allowMouseDrag
                        w="100%"
                        gap="4"
                        loop
                    >
                        <Carousel.Control
                            justifyContent="center"
                            gap="2"
                            width="full"
                        >
                            <CustomTooltip
                                content="Card anterior"
                            >
                                <Carousel.PrevTrigger asChild>
                                    <IconButton
                                        aria-label="Card anterior"
                                        variant="ghost"
                                        size="lg"
                                        color="brand.primaryDark"
                                        p="2"
                                    >
                                        <FaAngleLeft />
                                    </IconButton>
                                </Carousel.PrevTrigger>
                            </CustomTooltip>
                            <Carousel.ItemGroup width="full" p="2">
                                {carrosselConteudo.map((card, index) => (
                                    <Carousel.Item
                                        key={card.id}
                                        index={index}
                                        rounded="xl"
                                        shadow="card"
                                        h="100%"
                                        w="64"
                                    >
                                        <Card.Root
                                            overflow="hidden"
                                            bg="brand.primaryLight"
                                            rounded="xl"
                                            h="100%"
                                        >
                                            <Center
                                                mt="8"
                                                color="brand.primaryDark"
                                            >
                                                {card.icone}
                                            </Center>
                                            <Card.Body gap="2">
                                                <Card.Title
                                                    textStyle="headingXS"
                                                    color="brand.primaryDark"
                                                    textAlign="center"
                                                >
                                                    {card.titulo}
                                                </Card.Title>
                                                <Card.Description
                                                    textAlign="center"
                                                    textStyle="inputPlaceholder"
                                                    color="brand.neutral"
                                                >
                                                    {card.conteudo}
                                                </Card.Description>
                                            </Card.Body>
                                        </Card.Root>
                                    </Carousel.Item>
                                ))}
                            </Carousel.ItemGroup>
                            <CustomTooltip
                                content="Próximo card"
                            >
                                <Carousel.NextTrigger asChild>
                                    <IconButton
                                        aria-label="Próximo card"
                                        variant="ghost"
                                        size="lg"
                                        color="brand.primaryDark"
                                        p="2"
                                    >
                                        <FaAngleRight />
                                    </IconButton>
                                </Carousel.NextTrigger>
                            </CustomTooltip>
                        </Carousel.Control>
                    </Carousel.Root>
                </Box>
                <Box
                    //minH="calc(100vh - 88px)"
                    position="relative"
                    id="info"
                    scrollSnapAlign="start"
                >
                    <Heading
                        textAlign="left"
                        mt="8"
                        mb="3"
                        fontStyle="normal"
                        fontFamily="body"
                        fontSize="30px"
                        fontWeight="700"
                        color="brand.primaryLight"
                        style={{
                            WebkitTextStroke: "1px var(--chakra-colors-brand-neutral)",
                        }}
                    >
                        O PROJETO
                    </Heading>
                    <Box
                        mx="14"
                    >
                        <Heading
                            textAlign="left"
                            textStyle="headingMD"
                            color="brand.primaryDark"
                        >
                            Primeiros arquivos
                        </Heading>
                        <Text
                            textStyle="bodyText"
                            color="brand.neutral"
                            textAlign="left"
                            w="70%"
                            my="2"
                        >
                            Tudo começou com uma iniciativa colaborativa entre instituições da Rede Federal de Educação Profissional, Científica e Tecnológica para reunir e organizar materiais educativos sobre inovação, transferência de tecnologia, propriedade intelectual e ambientes promotores de inovação. Esse trabalho deu origem a uma plataforma de conteúdos que serviu como base para o desenvolvimento deste projeto — conheça a iniciativa original.
                        </Text>
                        <Link
                            href="https://padlet.com/ceov/trilha-formativa-para-inovacao-z8blynsyevyi7z4z"
                            target="_blank"
                            variant="underline"
                            color="brand.link"
                            _hover={{
                                color: "brand.primaryDark",
                                textDecoration: "none",
                            }}
                            textStyle="bodyText"
                            textAlign="left"
                            display="flex"
                        >
                            Trilha Formativa para Inovação
                            <FaExternalLinkAlt color="brand.link" />
                        </Link>
                        {/** Imagem da trilha aqui */}
                        <Box
                            w="70%"
                            ml="auto"
                            mt="12"
                        >
                            <Heading
                                textAlign="right"
                                textStyle="headingMD"
                                color="brand.primaryDark"
                            >
                                Transformando
                            </Heading>
                            <Text
                                textStyle="bodyText"
                                color="brand.neutral"
                                textAlign="right"
                                my="2"
                            >
                                Inspirado nessa iniciativa, nasceu o Sistema Web Gamificado para Trilha Formativa em Inovação. Mantendo o mesmo propósito de disseminar conhecimento, o projeto incorporou elementos da gamificação para transformar a aprendizagem em uma experiência mais dinâmica, interativa e motivadora, incentivando cada participante a evoluir ao longo da trilha.
                            </Text>
                        </Box>
                    </Box>
                </Box>
                <Box
                    //minH="calc(100vh - 88px)"
                    position="relative"
                    id="gamification"
                    scrollSnapAlign="start"
                >
                    <Card.Root
                        bg="brand.primaryLight"
                        border="none"
                        px="10"
                        py="6"
                        rounded="2xl"
                        my="10"
                        mx="14"
                    >
                        <Grid
                            templateColumns="1fr 420px"
                            gap="10"
                            alignItems="center"
                        >
                            <Box>
                                <Card.Body
                                    rounded="xl"
                                >
                                    <Card.Title
                                        mb="3"
                                        textAlign="left"
                                        color="brand.primaryDark"
                                        textStyle="headingMD"

                                    >
                                        Gamificação
                                    </Card.Title>

                                    <Text
                                        textAlign="justify"
                                        textStyle="bodyText"
                                        color="brand.neutral"
                                    >
                                        A gamificação leva para o aprendizado o que os jogos têm de melhor: desafios, conquistas e uma sensação constante de evolução. Ao utilizar recursos como pontos, distintivos, missões e feedback, ela torna a jornada de aprendizagem mais envolvente, despertando a curiosidade, incentivando a participação e tornando cada conquista parte do caminho.
                                    </Text>
                                </Card.Body>
                            </Box>
                            <Box w="100%">
                                <Skeleton
                                    loading={!loadedGamificacao}
                                    maxW="500px"
                                    mb="10"
                                    h="80"
                                >
                                    <Image
                                        src={trilhaFormativa}
                                        alt="Trilha Formativa em Inovações"
                                        w="100%"
                                        h="320px"
                                        objectFit="cover"
                                        onLoad={() => setLoadedGamificacao(true)}
                                        rounded="xl"
                                    />
                                </Skeleton>
                            </Box>
                        </Grid>
                    </Card.Root>
                    <Box>
                        <Stack
                            direction="row"
                            justify="center"
                        >
                            <Link
                                color="brand.primaryDark"
                                href="/cadastroAventureiro"
                                _hover={{
                                    color: "brand.link",
                                    textDecoration: "none",
                                }}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                gap="5"
                                textDecoration="none"
                            >
                                <FaGamepad
                                    size={120}
                                />
                                <Stack
                                    gap="-1"
                                >
                                    <Text
                                        textAlign="center"
                                        textStyle="headingSM"
                                    >
                                        Vamos
                                    </Text>
                                    <Text
                                        textAlign="center"
                                        fontStyle="normal"
                                        fontFamily="body"
                                        fontSize="30px"
                                        fontWeight="700"
                                        color="brand.primaryLight"
                                        style={{
                                            WebkitTextStroke: "1px var(--chakra-colors-brand-neutral)",
                                        }}
                                    >
                                        JOGAR
                                    </Text>
                                </Stack>
                            </Link>
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        </Box >
    );
}