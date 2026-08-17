# Trilha Formativa de Inovação — Frontend

<p align="center">

Interface web da plataforma **Trilha Formativa de Inovação**, desenvolvida para proporcionar uma experiência interativa e gamificada para acesso a conteúdos, atividades e funcionalidades da plataforma.

</p>

---

## Tecnologias utilizadas

Este projeto foi desenvolvido utilizando:

* **React**
* **TypeScript**
* **Vite**
* **Chakra UI**
* **DnD Kit**
* **ESLint**

---

## Pré-requisitos

Antes de iniciar, é necessário possuir as seguintes ferramentas instaladas:

* **Node.js**
* **npm**

Para verificar se estão instalados corretamente:

```bash
node -v
npm -v
```

---

## Instalação

### Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
```

### Acesse a pasta do projeto

```bash
cd trilha-formativa-inovacao-frontend
```

### Instale as dependências

```bash
npm install
```

O comando utilizará o arquivo `package.json` para instalar automaticamente todas as dependências necessárias para o funcionamento da aplicação.

Entre elas:

* React
* Chakra UI
* DnD Kit

> **Não é necessário instalar essas bibliotecas manualmente.**

---

## Executando o projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Após a execução, o terminal exibirá o endereço onde a aplicação estará disponível.

Normalmente:

```text
http://localhost:5173
```

---

## Estrutura do projeto

```text
public/              → Arquivos públicos
src/
 ├── components/     → Componentes reutilizáveis
 ├── pages/          → Telas da aplicação
 ├── api/            → Comunicação com a API
 ├── assets/         → Recursos estáticos
 ├── types/          → Tipagens e interfaces
 └── ...
package.json         → Dependências e scripts
vite.config.ts       → Configuração do Vite
tsconfig.json        → Configuração do TypeScript
```

---

## Scripts disponíveis

### Executar em desenvolvimento

```bash
npm run dev
```

### Gerar versão de produção

```bash
npm run build
```

### Visualizar a versão de produção localmente

```bash
npm run preview
```

---

## Dependências

Todas as dependências necessárias estão definidas no arquivo:

```text
package.json
```

Portanto, ao configurar o projeto em uma nova máquina, basta executar:

```bash
npm install
```

A pasta `node_modules` não é versionada no repositório e será recriada automaticamente durante a instalação das dependências.

---

## Integração com o Backend

A aplicação frontend pode depender da API responsável pelo fornecimento e gerenciamento dos dados da plataforma.

Para utilizar todas as funcionalidades corretamente, verifique também as instruções de configuração e execução do backend no repositório correspondente.

---

<p align="center">

**Desenvolvido para a plataforma Trilha Formativa de Inovação 🎓💡**

</p>
