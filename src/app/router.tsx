import { createBrowserRouter } from "react-router-dom"

import GeneralLayout from "@/app/GeneralLayout"
import ProtectedRoute from "@/routes/ProtectedRoute"
import RoleRoute from "@/routes/RoleRoute"

import BancoQuestoes from "@/pages/bancoQuestoes"
import BancoMateriais from "@/pages/bancoMateriais"
import CadastroMateriais from "@/pages/cadastroMateriais"
import CadastroQuestoes from "@/pages/cadastroQuestoes"
import LandingPage from "@/pages/landingPage"
import { CadastroAventureiro } from "@/pages/cadastroAventureiro"
import { Login } from "@/pages/login"
import TelaPrincipal from "@/pages/telaPrincipal"
import { TelaRegional } from "@/pages/telaRegional"
import DadosAventureiro from "@/pages/dadosAventureiro"
import Distintivos from "@/pages/distintivos"
import Quiz from "@/pages/quiz"
import Material from "@/pages/material"
import Tarefa from "@/pages/tarefa"
import ConditionalRoute from "@/routes/ConditionalRoute"
import BancoMissoesAtividade from "@/pages/bancoMissoesAtividade"
import CadastroMissoesAtividade from "@/pages/cadastroMissoesAtividade"

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <GeneralLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/banco-questoes",
        element: (
          <RoleRoute roles={["admin"]}>
            <BancoQuestoes />
          </RoleRoute>
        ),
      }, {
        path: "/banco-materiais",
        element: (
          <RoleRoute roles={["admin"]}>
            <BancoMateriais />
          </RoleRoute>
        ),
      }, {
        path: "/banco-missoes-atividade",
        element: (
          <RoleRoute roles={["admin"]}>
            <BancoMissoesAtividade />
          </RoleRoute>
        ),
      }, {
        path: "/cadastro-materiais/:idMissao?",
        element: (
          <RoleRoute roles={["admin"]}>
            <CadastroMateriais />
          </RoleRoute>
        ),
      }, {
        path: "/cadastro-questoes/:idMissao?/:idQuestao?",
        element: (
          <RoleRoute roles={["admin"]}>
            <CadastroQuestoes />
          </RoleRoute>
        ),
      }, {
        path: "/cadastro-missao-atividade/:idMissao?",
        element: (
          <RoleRoute roles={["admin"]}>
            <CadastroMissoesAtividade />
          </RoleRoute>
        ),
      },

      {
        path: "/trilhaFormativaInovacao",
        element: (
          <RoleRoute roles={["usuario"]}>
            <TelaPrincipal />
          </RoleRoute>
        ),
      }, {
        path: "/trilhaFormativaInovacao/:ParamTrilha",
        element: (
          <RoleRoute roles={["usuario"]}>
            <TelaRegional />
          </RoleRoute>
        ),
      }, {
        path: "/dadosAventureiro",
        element: (
          <RoleRoute roles={["usuario"]}>
            <DadosAventureiro />
          </RoleRoute>
        ),
      }, {
        path: "/editarDadosAventureiro",
        element: (
          <RoleRoute roles={["usuario"]}>
            <CadastroAventureiro />
          </RoleRoute>
        )
      }, {
        path: "/distintivos",
        element: (
          <RoleRoute roles={["usuario"]}>
            <Distintivos />
          </RoleRoute>
        )
      }, {
        path: "/trilhaFormativaInovacao/:ParamTrilha/material/:idMissao",
        element: (
          <RoleRoute roles={["usuario"]}>
            <Material />
          </RoleRoute>
        )
      }, {
        path: "/trilhaFormativaInovacao/:ParamTrilha/quiz/:idMissao",
        element: (
          <RoleRoute roles={["usuario"]}>
            <Quiz />
          </RoleRoute>
        )
      }, {
        path: "/trilhaFormativaInovacao/:ParamTrilha/tarefa/:idMissao",
        element: (
          <RoleRoute roles={["usuario"]}>
            <Tarefa />
          </RoleRoute>
        )
      }, {
        path: "/trilhaFormativaInovacao/tarefaFinal",
        element: (
          <RoleRoute roles={["usuario"]}>
            <ConditionalRoute>
              <Tarefa />
            </ConditionalRoute>
          </RoleRoute>
        )
      }
    ],
  }, {
  element: <GeneralLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      }, {
        path: "/login",
        element: <Login />,
      }, {
        path: "/cadastroAventureiro",
        element: <CadastroAventureiro />,
      }, {
        path: "recuperarSenha",
        //element: <LandingPage />,
        //element: <Home />,
      },
    ],
  },
])