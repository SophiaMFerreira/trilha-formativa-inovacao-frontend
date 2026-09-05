import { toaster } from "@/components/commons/toaster"
import { mensagensErroConsole } from "@/config/mensagensError"
import { mensagensToastErro } from "@/config/mensagensToaster"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

type Props = {
  children: React.ReactNode
  roles: string[]
}

export default function RoleRoute({
  children,
  roles,
}: Props) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!roles.includes(user.role)) {
    toaster.create(mensagensToastErro.permissaoNegada)
    console.error(mensagensErroConsole.permissaoNegada);
    
    if(user.role === "admin"){
      return <Navigate to="/banco-materiais" replace />
    } else {
      return <Navigate to="/trilhaFormativaInovacao" replace />
    }
  }

  return children
}