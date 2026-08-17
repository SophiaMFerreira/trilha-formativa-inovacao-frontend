import { useGame } from "@/hooks/useGame";
import { Navigate } from "react-router-dom";

type Props = {
    children: React.ReactNode;
};

export default function ConditionalRoute({ children }: Props) {
    const { progressoTotal } = useGame();

    if (progressoTotal < 90) {
        return <Navigate to="/trilhaFormativaInovacao" replace />;
    }

    return children;
}