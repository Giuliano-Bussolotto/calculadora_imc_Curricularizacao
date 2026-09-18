# Calculadora IMC

Projeto mobile inicial com React Native, Expo, JavaScript e npm.

A tela inicial exibe apenas **Calculadora IMC** e, abaixo, **Projeto inicial**.

## Iniciar

No terminal, dentro da pasta `calculadora-imc`:

```sh
npm install
npm start
```

As dependências já estão instaladas neste computador. Use `npm install` ao copiar o projeto para outro ambiente. Requer Node.js compatível com o Expo SDK 57 (o projeto foi configurado com Node.js 24).

Com o servidor iniciado, abra o Expo Go compatível com o SDK 57 no celular e leia o QR code exibido no terminal. O computador e o celular devem estar na mesma rede.

Também estão disponíveis `npm run android` e `npm run ios`, que exigem um emulador Android ou simulador iOS configurado, respectivamente.

## Arquivos

- `App.js`: tela inicial e estilos.
- `index.js`: registro do componente principal no Expo.
- `app.json`: nome do aplicativo, orientação e ícones.
- `package.json`: scripts e as dependências diretas `expo`, `react` e `react-native`.
- `package-lock.json`: versões resolvidas pelo npm.
- `assets/`: ícones padrão do template Expo.
- `.gitignore`: exclusão de dependências e arquivos locais do controle de versão.
- `LICENSE`: licença do template Expo.

Este primeiro passo não implementa cálculo de IMC, autenticação, Supabase, banco de dados ou histórico. Não há configuração TypeScript no aplicativo.

## Verificação realizada

- `npx expo install --check`: dependências compatíveis.
- `npx expo-doctor`: 21 de 21 verificações aprovadas.
- `npx expo export --platform android --platform ios`: bundles JavaScript/Hermes gerados sem erros para as duas plataformas.
- `npm start -- --localhost --port 8081`: servidor Metro iniciado, status `packager-status:running` e manifesto com o nome `Calculadora IMC`.

O servidor usado na verificação foi encerrado. Execute `npm start` para iniciar novamente. A tela não foi testada em celular ou simulador neste ambiente.

O `npm audit` registrou 10 alertas moderados na cadeia de dependências do Expo, originados em `uuid`, usado por `xcode`. A simulação de `npm audit fix` manteve esses alertas; a alternativa forçada sugerida pelo npm rebaixaria o Expo para o SDK 46. Foi mantida a combinação compatível do template oficial. Esses alertas não impediram as verificações de inicialização e compilação.
