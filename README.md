# Calculadora IMC

Projeto mobile inicial com React Native, Expo, JavaScript e npm.

A tela exibe o título **Calculadora IMC**, os campos **Peso (kg)** e **Altura (m)**, o botão **Calcular** e uma área de resultado.

O cálculo usa peso / altura² e mostra o IMC com duas casas decimais, seguido de “Cálculo realizado.”. Os campos aceitam vírgula ou ponto decimal. Valores vazios, inválidos ou menores ou iguais a zero exibem uma mensagem de validação. Ao editar um campo, o resultado anterior é substituído por uma instrução para calcular novamente.

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

O aplicativo usa somente JavaScript e as três dependências originais. Não há histórico, autenticação, Supabase, banco de dados ou configuração TypeScript.

## Verificação da configuração inicial

- `npx expo install --check`: dependências compatíveis.
- `npx expo-doctor`: 21 de 21 verificações aprovadas.
- `npx expo export --platform android --platform ios`: bundles JavaScript/Hermes gerados sem erros para as duas plataformas.
- `npm start -- --localhost --port 8081`: servidor Metro iniciado, status `packager-status:running` e manifesto com o nome `Calculadora IMC`.

O servidor usado na verificação foi encerrado. Execute `npm start` para iniciar novamente. A tela não foi testada em celular ou simulador neste ambiente.

O `npm audit` registrou 10 alertas moderados na cadeia de dependências do Expo, originados em `uuid`, usado por `xcode`. A simulação de `npm audit fix` manteve esses alertas; a alternativa forçada sugerida pelo npm rebaixaria o Expo para o SDK 46. Foi mantida a combinação compatível do template oficial. Esses alertas não impediram as verificações de inicialização e compilação.

## Verificação da calculadora

- 14 verificações da lógica aprovadas: cálculo e arredondamento, vírgula/ponto, valores inválidos e atualização do resultado ao editar os campos.
- Bundles Android e iOS gerados sem erros pelo Expo.
- Servidor Metro iniciado com `npm start -- --port 8082`: status ativo, manifesto correto e bundle de desenvolvimento carregado com HTTP 200. O servidor de teste foi encerrado ao concluir.
- O teste com `--localhost` apresentou `connect ECONNREFUSED 127.0.0.1:8082`; reiniciar com a configuração padrão de rede do Expo resolveu o acesso ao bundle.
- Nenhuma dependência adicionada.
- A tela ainda não foi testada em celular ou simulador.
