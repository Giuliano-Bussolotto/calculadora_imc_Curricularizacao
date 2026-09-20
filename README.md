# Calculadora IMC

Aplicativo mobile em **JavaScript**, com React Native, Expo e npm. Este guia ajuda um segundo desenvolvedor a preparar o ambiente, executar o projeto e colaborar pelo GitHub.

O aplicativo inicia em uma tela de boas-vindas com espaço reservado para a logo da clínica, opções de telefone/e-mail e acesso demonstrativo pelo botão **Continuar**. Não há autenticação real: é possível continuar com o campo vazio, e nenhum dado de acesso é enviado ou persistido. **Criar conta** apenas exibe um aviso sobre a próxima etapa.

A tela da calculadora apresenta altura antes de peso, calcula o IMC com duas casas decimais e exibe a classificação para adultos. Aceita peso como `70`, `70,5` ou `70.5` e altura como `175`, `1,75` ou `1.75`. Alturas a partir de 10 são interpretadas em centímetros. Ainda não há histórico, autenticação ou banco de dados.

## Plataformas suportadas e distribuição futura

Requisito oficial atualizado em **20/09/2026**: o aplicativo da clínica deverá oferecer suporte a **Android e iOS**, mantendo React Native, Expo e JavaScript.

| Plataforma | Canal de distribuição previsto |
| --- | --- |
| Android | Google Play Store |
| iOS | Apple App Store |

Todas as novas funcionalidades deverão preservar a compatibilidade com as duas plataformas. As decisões sobre componentes, navegação, dependências e APIs devem considerar Android e iOS. Nas próximas entregas de funcionalidades, verificar o funcionamento e a interface em ambas as plataformas, registrando os testes realizados e eventuais pendências de cada uma.

A distribuição nas lojas é um objetivo futuro. Esta atualização registra o requisito na documentação; não implementa nem configura publicação, não modifica funcionalidades existentes e não cria integrações com Supabase ou Firebase nem banco de dados.

## 1. Instalar Node.js, npm e Git

### Node.js e npm

1. Acesse o [download oficial do Node.js](https://nodejs.org/en/download).
2. Escolha **Node.js 24 LTS**, linha usada neste projeto, e o seu sistema operacional.
3. No Windows ou macOS, baixe e execute o instalador. No Linux, siga as instruções da página para sua distribuição.
4. Mantenha o npm incluído na instalação e abra novamente o terminal.
5. Confirme a instalação:

```sh
node --version
npm --version
```

O primeiro comando deve mostrar `v24.x.x`. O npm é o gerenciador que instalará as bibliotecas do aplicativo. Veja também o [guia oficial de instalação do Node.js e npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/).

### Git

Instale o Git pelo [site oficial](https://git-scm.com/downloads), seguindo as instruções para seu sistema. No Windows, você pode usar o terminal Git Bash instalado com ele. Depois, confira:

```sh
git --version
```

Você também precisará de uma conta no GitHub e acesso ao repositório da equipe para enviar alterações e abrir pull requests.

## 2. Clonar o repositório

No GitHub, abra o repositório, clique em **Code → HTTPS** e copie o endereço. No terminal, entre na pasta onde deseja guardar o projeto e execute:

```sh
git clone https://github.com/SEU-USUARIO-OU-ORGANIZACAO/SEU-REPOSITORIO.git calculadora-imc
cd calculadora-imc
```

**Substitua o endereço de exemplo pela URL real.** Esta cópia local ainda não tinha um remoto configurado quando o guia foi escrito; confirme o endereço com o responsável pelo projeto.

O clone configura o remoto `origin` automaticamente. Confira o estado do projeto:

```sh
git remote -v
git status
git branch --show-current
```

Se você já tem uma cópia local, entre nela em vez de clonar novamente. Caso `git remote -v` não mostre nada, configure `origin` apenas depois de confirmar a URL do repositório existente:

```sh
git remote add origin https://github.com/SEU-USUARIO-OU-ORGANIZACAO/SEU-REPOSITORIO.git
```

Se o projeto ainda não estiver publicado no GitHub, o responsável deve publicar o repositório antes de outro desenvolvedor conseguir cloná-lo ou abrir um pull request.

## 3. Instalar React, React Native e Expo

Dentro da pasta que contém `package.json`, execute:

```sh
npm ci
```

Esse comando instala as dependências nas versões registradas em `package-lock.json`, incluindo React, React Native e Expo. Não é necessário instalá-los separadamente ou globalmente. A CLI do Expo já vem com a dependência `expo` e pode ser usada via `npx expo`.

| Dependência | Versão declarada no projeto | Papel |
| --- | --- | --- |
| React | `19.2.3` | Componentes e estado da interface |
| React Native | `0.86.3` | Componentes nativos para Android e iOS |
| Expo | `~57.0.24` | Ferramentas para executar e compilar o aplicativo |

O projeto usa npm. Preserve o `package-lock.json` e não misture outros gerenciadores de pacotes. Para uma instalação após o clone, prefira `npm ci`; `npm install` é usado quando a equipe pretende adicionar ou atualizar dependências e atualizar o lockfile. [Documentação do npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

## 4. Executar no celular com Expo Go

1. Instale o **Expo Go** compatível com o **SDK 57** no celular, conforme as orientações da [página oficial do Expo Go](https://expo.dev/go).
2. Conecte o computador e o celular à mesma rede Wi-Fi.
3. Na pasta do projeto, inicie o servidor:

```sh
npm start
```

No Android, use o leitor de QR code do Expo Go. No iPhone, leia o QR code com a câmera e abra o link no Expo Go. Mantenha o terminal aberto durante o uso. Para encerrar o servidor, pressione **Ctrl+C**. Consulte o [guia de execução do Expo](https://docs.expo.dev/get-started/start-developing/).

### Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm start` | Inicia o servidor Expo e mostra o QR code |
| `npm run android` | Abre em um emulador Android configurado ou aparelho conectado via ADB |
| `npm run ios` | Abre no simulador iOS; exige macOS e Xcode com simulador configurado |
| `npm start -- --clear` | Reinicia o Expo limpando o cache do Metro |
| `npm start -- --port 8082` | Usa outra porta, caso a porta padrão esteja ocupada |
| `npx expo install --check` | Verifica a compatibilidade das dependências com o Expo |

Para começar com um celular e Expo Go, não é necessário configurar emuladores. Este projeto não tem execução web configurada.

Se o celular não conectar, confirme a rede Wi-Fi e a compatibilidade do Expo Go. Use `npm start` com a configuração padrão de rede; `--localhost` não permite acesso a partir de outro aparelho. Já houve uma falha `ECONNREFUSED` durante um teste local que foi resolvida reiniciando com a configuração padrão. [Referência da CLI do Expo](https://docs.expo.dev/more/expo-cli/).

## 5. Conhecer os arquivos

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `App.js` | Entrada do aplicativo; renderiza o navegador local |
| `src/navigation/AppNavigator.js` | Fluxo temporário entre login e calculadora; voltar no Android retorna ao login |
| `src/screens/LoginScreen.js` | Interface de boas-vindas, telefone/e-mail e ações demonstrativas |
| `src/screens/CalculatorScreen.js` | Calculadora existente, preservada com validação, cálculo, classificação e estilos |
| `src/components/ClinicLogo.js` | Espaço reservado para substituir pela logo oficial no futuro |
| `tests/app.test.cjs` | Testes de lógica, eventos de acesso, navegação e regressão da calculadora |
| `index.js` | Registro do componente principal no Expo |
| `app.json` | Configuração do aplicativo e ícones |
| `package.json` | Dependências e comandos npm |
| `package-lock.json` | Versões resolvidas das dependências |
| `assets/` | Ícones do aplicativo |
| `.gitignore` | Arquivos locais e dependências que não entram no Git |
| `README.md` | Guia de instalação e colaboração |

O código do aplicativo usa JavaScript, sem TypeScript. Novas telas poderão ser criadas em `src/screens`, componentes reutilizáveis em `src/components` e a navegação evoluirá em `src/navigation`. Nesta etapa só existem login e calculadora; o estado local de navegação não representa uma sessão autenticada. Nenhuma dependência foi adicionada.

## 6. Colaborar usando Git e pull request

### Preparar sua identificação

Na pasta do repositório, configure os dados usados nos seus commits. Troque os exemplos pelos seus dados; use um e-mail verificado no GitHub ou o endereço privado fornecido pela plataforma:

```sh
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"
```

### Atualizar a base e criar uma branch

Comece com `git status`. Se houver alterações pendentes, salve-as em um commit na branch correta antes de trocar de branch. Com a árvore de trabalho limpa:

```sh
git switch main
git pull --ff-only origin main
git switch -c feature-minha-alteracao
```

`git pull` traz as alterações remotas. `--ff-only` evita criar um merge inesperado; se houver divergência, confira com a equipe como integrar as mudanças.

Se a branch já existir localmente, use `git switch NOME-DA-BRANCH`, sem `-c`. Para uma branch existente somente no remoto, execute `git fetch origin` e depois `git switch --track origin/NOME-DA-BRANCH`. Substitua `NOME-DA-BRANCH` pelo nome real.

### Revisar e salvar as alterações

O exemplo abaixo considera uma mudança somente no README:

```sh
git status
git diff -- README.md
git add README.md
git diff --cached
git commit -m "docs: atualiza guia para desenvolvedores"
git push -u origin feature-minha-alteracao
```

Use o nome da sua branch no `push`. Para esta tarefa de documentação, o nome é `feature-criacao-README`. Em alterações de código, adicione explicitamente os arquivos envolvidos. `commit` salva localmente; `push` envia os commits ao GitHub. A autenticação pode ser feita pelo gerenciador de credenciais do Git ou por SSH já configurado.

### Abrir o pull request no GitHub

1. Abra o repositório no GitHub após o push.
2. Clique em **Compare & pull request**, ou em **Pull requests → New pull request**.
3. Selecione **base: main** e **compare: sua branch**. Confira com a equipe se a branch de destino deve ser outra.
4. Revise **Files changed** e confirme que só aparecem os arquivos pretendidos.
5. Escreva um título e uma descrição explicando o que mudou e como foi verificado. Solicite um revisor e clique em **Create pull request**.
6. Para responder à revisão, faça novos commits na mesma branch e execute `git push`; o pull request será atualizado automaticamente.
7. Aguarde a revisão e siga o processo da equipe para o merge.

Se você não tiver permissão para enviar branches ao repositório, peça acesso ou use um **fork**: clone seu fork, envie sua branch para ele e abra o pull request com destino ao repositório original. Veja o [guia rápido de pull requests](https://docs.github.com/en/pull-requests/get-started/pull-request-quickstart) e as [instruções de criação](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request).

## 7. Verificar antes de pedir revisão

Para documentação, confira os comandos, a formatação e `git diff --check`. Execute os testes automatizados disponíveis:

```sh
npm test
```

Os testes usam `node:test` e os transformadores Babel já trazidos pelo Expo, com hooks e componentes nativos simulados. Verificam eventos da interface, navegação e lógica da calculadora; não substituem testes visuais em Android e iOS.

Para mudanças no aplicativo, verifique o fluxo em Android e iOS, respeitando os comportamentos próprios de cada plataforma. Registre o que foi validado e o que ficou pendente. Teste, pelo menos:

- Tela inicial com espaço para a logo, título, descrição e opções de telefone/e-mail.
- Alternar entre telefone e e-mail: teclado adequado e valores independentes.
- **Continuar**, inclusive com campo vazio, abre a calculadora.
- **Criar conta** mostra o aviso e não abre cadastro nem realiza autenticação.
- Botão/gesto de voltar do Android, com o teclado fechado, retorna da calculadora ao login.
- Em tela pequena ou com fonte ampliada, conteúdo rolável e controles acessíveis acima do teclado.

- Altura antes de peso na tela.
- Peso `70` com altura `175`, `1,75` e `1.75`: IMC `22,86` e classificação `Peso adequado`.
- Peso `70,5` e `70.5`: ambas as entradas devem funcionar.
- Campos vazios, zero, negativos e texto inválido: devem exibir a mensagem de validação.

A compilação JavaScript das duas plataformas pode ser verificada com:

```sh
npx expo export --platform android --platform ios
```

Isso gera bundles em `dist/`; não instala o app no celular nem substitui um teste em dispositivo.

Na configuração inicial, o npm registrou 10 alertas moderados na cadeia de dependências do Expo, sem correção automática compatível naquele momento. Esse é um registro da instalação inicial; use `npm audit` para consultar a situação atual. Atualizações de dependências devem ser avaliadas separadamente de mudanças de documentação.
