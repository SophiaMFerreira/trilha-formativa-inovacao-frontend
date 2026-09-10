import { Box, Image, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaAward } from "react-icons/fa";

interface DistintivoProps {
    imagem?: string;
    titulo?: string;
    adquirido: boolean;
    trofeu?: boolean;
    tamanho?: number;
    onClick?: () => void;
}

export default function DistintivoImagem({
    imagem,
    titulo,
    adquirido,
    trofeu = false,
    tamanho = 100,
    onClick,
}: DistintivoProps) {
    const [imagemCarregando, setImagemCarregando] = useState(true);
    const [erroImagem, setErroImagem] = useState(false);

    const mostrarImagem = imagem && !erroImagem && adquirido;
    const tamanhoCalculado = trofeu ?
        (adquirido ? 300 : tamanho) : 
        (adquirido ? 150 : tamanho)

    return (
        <Stack
            align="center"
            gap="-2"
            cursor={onClick ? "pointer" : undefined}
            onClick={onClick}
        >
            <Box
                w={`${tamanhoCalculado}px`}
                h={`${tamanhoCalculado}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {mostrarImagem ? (
                    <>
                        {imagemCarregando && (
                            <Skeleton
                                w={`${tamanhoCalculado}px`}
                                h={`${tamanhoCalculado}px`}
                                borderRadius="full"
                            />
                        )}

                        <Image
                            src={imagem}
                            alt={titulo ?? "Troféu final"}
                            w={`${tamanhoCalculado}px`}
                            h={`${tamanhoCalculado}px`}
                            objectFit="contain"
                            display={imagemCarregando ? "none" : "block"}
                            onLoad={() => setImagemCarregando(false)}
                            onError={() => {
                                setImagemCarregando(false);
                                setErroImagem(true);
                            }}
                        />
                    </>
                ) : (
                    <Box
                        color={
                            adquirido
                                ? "brand.primaryDark"
                                : "gray.300"
                        }
                    >
                        <FaAward size={adquirido ? 200 : tamanho} />
                    </Box>
                )}
            </Box>

            {!trofeu && adquirido && (
                <Text 
                    color="brand.primaryDark"
                    textStyle="bodyTextBold"
                >
                    {titulo}
                </Text>
            )}
        </Stack>
    );
}