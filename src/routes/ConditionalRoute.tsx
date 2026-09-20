import { useGame } from "@/hooks/useGame";
import { Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { PROGRESSO_MINIMO_TAREFA_FINAL } from "@/utils/bloqueioTarefa";

type Props = {
    children: React.ReactNode;
};

export default function ConditionalRoute({ children }: Props) {
    const { carregando, progressoTotal } = useGame();

    /*
     * Enquanto o progresso do usuário não chega, a rota não decide: nem
     * libera a tarefa final nem devolve o aventureiro para o mapa.
     */
    if (carregando) {
        return (
            <Center h="60vh">
                <Spinner
                    size="lg"
                    color="brand.primaryDark"
                />
            </Center>
        );
    }

    if (progressoTotal < PROGRESSO_MINIMO_TAREFA_FINAL) {
        return <Navigate to="/trilhaFormativaInovacao" replace />;
    }

    return children;
}
