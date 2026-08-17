import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Box, HStack, Progress, SimpleGrid, Stack } from "@chakra-ui/react";
import CustomTooltip from "@/components/commons/customTooltip";
import { Ranking } from "@/components/ranking";
import { FaAward } from "react-icons/fa";

import { useGame } from "@/hooks/useGame";
import MapaPrincipal from "@/components/commons/mapaPrincipal";


export default function TelaPrincipal() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { progressoTotal, progressoMissoes, distintivos } = useGame()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // dados de usuario para coletar a imagem

    return (
        <SimpleGrid
            columns={{
                base: 1,
                lg: 12,
            }}
            gap={10}
            bg="gray.50"
            h="full"
            maxH="calc(100vh - 88px)"
            py={10}
            px="40"
            alignItems="stretch"
        >
            <Stack
                gap="5"
                gridColumn={{ lg: "span 9" }}
                h="100%"
            >
                <HStack
                    gap="5"
                >
                    <Avatar.Root
                        size="lg"
                        bg="#2f9e411f"
                        onClick={() => navigate(`/dadosAventureiro`)}
                    >
                        <Avatar.Fallback color="brand.primaryDark" />
                        {/**<Avatar.Image src={imagem} />*/}
                    </Avatar.Root>
                    <HStack gap={2}>
                        {distintivos.map((distintivo) => (
                            distintivo.adquirido ?
                                (
                                    <CustomTooltip
                                        content={distintivo.titulo}
                                        key={distintivo.titulo}
                                    >
                                        <Box
                                            key={distintivo.titulo}
                                            color="brand.primaryDark"
                                            onClick={() => navigate(`/distintivos`)}
                                        >
                                            <FaAward size={28} />
                                        </Box>
                                    </CustomTooltip>
                                ) : (
                                    <Box
                                        key={distintivo.titulo}
                                        color="gray.300"
                                        onClick={() => navigate(`/distintivos`)}
                                    >
                                        <FaAward size={28} />
                                    </Box>
                                )
                        ))}
                    </HStack>
                    <CustomTooltip
                        content={`Progresso total: ${Math.round(progressoTotal)}%`}
                    >
                        <Progress.Root
                            defaultValue={progressoTotal}
                            rounded="full"
                            w="100%"
                            ml="10"
                            size="lg"
                        >
                            <Progress.Track
                                bg="brand.primaryLight"
                            >
                                <Progress.Range
                                    rounded="full"
                                    bg="brand.primaryDark"
                                />
                            </Progress.Track>
                        </Progress.Root>
                    </CustomTooltip>
                </HStack>
                <   MapaPrincipal
                    navigate={navigate}
                    progressos={progressoMissoes}
                    progressoTotal={progressoTotal}
                />
            </Stack>
            <Box gridColumn={{ lg: "span 3" }}>
                <Ranking />
            </Box>
        </SimpleGrid >
    );
}