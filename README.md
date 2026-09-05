# 🏷️ ConvertTube
*O seu conversor de vídeos do YouTube rápido, seguro e de alta qualidade.*

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Electron](https://img.shields.io/badge/Electron-44.2-47848f?style=for-the-badge&logo=electron)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

---

## 📖 ÍNDICE

- [Visão Geral & Motivação](#-visão-geral--motivação)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Pré-requisitos e Instalação](#-pré-requisitos-e-instalação)
- [Como Executar](#️-como-executar)
- [Arquitetura do Projeto](#️-arquitetura-do-projeto)
- [Licença & Contacto](#-licença--contacto)

---

## 🚀 VISÃO GERAL & MOTIVAÇÃO

O **ConvertTube** é uma aplicação moderna, disponível tanto para Web como Desktop, projetada para simplificar o download e a conversão de vídeos do YouTube. O principal objetivo do software é oferecer aos audiófilos e criadores uma ferramenta sem anúncios, sem filas de espera demoradas, e que coloque a privacidade do utilizador em primeiro lugar. 

### Principais Funcionalidades

- **Qualidade Máxima de Áudio:** Extração e conversão de áudios masterizados com taxa de *320 kbps* e amostragem em *48 kHz*, garantindo que não há compressão secundária.
- **Conversão Instantânea:** Desenhado para realizar processos de extração rápidos e assíncronos.
- **Privacidade Garantida:** Todo o seu histórico de downloads fica guardado de forma segura e estritamente local no seu dispositivo. Nenhum dado é rastreado ou guardado na nuvem.
- **Multiplataforma:** Experiência consistente no Browser ou nativamente através da aplicação Desktop empacotada.
- **Interface Elegante:** Uma UI fluida, responsiva, com *dark mode* e transições suaves focadas na experiência do utilizador.

---

## 🛠️ TECNOLOGIAS UTILIZADAS

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema JavaScript/TypeScript:

- **[Next.js (v16)](https://nextjs.org/) & [React (v19)](https://react.dev/):** Escolhidos pela renderização rápida, roteamento moderno (App Router) e facilidade na construção de interfaces de alto desempenho.
- **[Electron](https://www.electronjs.org/):** Framework utilizado para empacotar a aplicação web num software desktop nativo, proporcionando acesso direto ao sistema de ficheiros do utilizador para os downloads.
- **[Tailwind CSS (v4)](https://tailwindcss.com/):** Framework de estilos utilitários que permite construir uma interface de utilizador esteticamente agradável e responsiva com um esforço de desenvolvimento reduzido.
- **[youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec) & [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg):** As "engines" vitais por detrás da aplicação, escolhidas pela sua fiabilidade ímpar no download e conversão de formatos de mídia.
- **[Lucide React](https://lucide.dev/):** Biblioteca de ícones leve e coerente para a interface.

---

## 📦 PRÉ-REQUISITOS E INSTALAÇÃO

Certifique-se de que tem as seguintes ferramentas instaladas no seu ambiente:
- **[Node.js](https://nodejs.org/)** (v20 ou superior recomendado)
- **NPM** (incluído com o Node), **Yarn** ou **PNPM**
- **FFmpeg** (Instalado e disponível nas variáveis de ambiente, caso a biblioteca estática requeira)

### Passos de Instalação

```bash
# 1. Clone este repositório para a sua máquina
git clone https://github.com/Drlazinho/convertYoutube.git

# 2. Navegue para a pasta do projeto
cd convertYoutube

# 3. Instale as dependências
npm install
```

*(Opcional)* Se o projeto necessitar de variáveis de ambiente, copie o ficheiro de exemplo e configure:
```bash
cp .env.example .env.local
```

---

## ⚙️ COMO EXECUTAR

### Ambiente de Desenvolvimento (Web)

Para correr a aplicação web localmente em modo de desenvolvimento (Next.js):

```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

### Ambiente de Desenvolvimento (Desktop / Electron)

Para iniciar a aplicação em modo Desktop nativo via Electron:

```bash
npm run electron:dev
```
*(Nota: Certifique-se de ter os scripts configurados corretamente no `package.json`)*

### Produção (Build)

Para criar os binários otimizados para produção:

```bash
# Para fazer a build da interface Next.js
npm run build

# Para empacotar a aplicação Desktop (Windows/Mac/Linux)
npm run electron:build
```

### Testes Automatizados

Caso deseje correr a suíte de testes do projeto:

```bash
npm run test
```

---

## 🗺️ ARQUITETURA DO PROJETO

Estrutura simplificada de diretórios do projeto para fácil navegação:

```text
convertYoutube/
├── app/                  # Rotas e componentes do Next.js (App Router)
├── electron/             # Código principal (Main Process) do Electron e IPC handlers
├── public/               # Ativos estáticos (imagens, ícones, fontes)
├── src/                  # Componentes reutilizáveis, hooks e utilitários
│   ├── components/       # Componentes de interface (UI) genéricos
│   ├── lib/              # Funções utilitárias e integrações (ffmpeg, ytdl)
│   └── styles/           # Configurações e ficheiros CSS globais
├── package.json          # Dependências e scripts do projeto
├── tailwind.config.ts    # Configuração de temas e estilos do Tailwind
└── next.config.mjs       # Configuração do compilador Next.js
```

---

## 📄 LICENÇA & CONTACTO

Este projeto está licenciado sob a licença **MIT** - veja o ficheiro [LICENSE](LICENSE) para mais detalhes.

Desenvolvido e mantido por **Lázaro Bonfim**.

- 💼 **LinkedIn:** [Lázaro Bonfim | LinkedIn](https://www.linkedin.com/in/lazarobonfim/)
- 🌐 **GitHub:** [@Drlazinho](https://github.com/Drlazinho)