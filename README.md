# Calculadora IMC

Aplicativo mobile desenvolvido em **React Native, Expo e JavaScript** para cálculo e classificação do Índice de Massa Corporal (IMC).

O projeto está sendo desenvolvido para fins acadêmicos e tem como objetivo evoluir para uma aplicação voltada ao acompanhamento de pacientes de uma clínica.

As classificações implementadas utilizam referências da **Organização Mundial da Saúde (OMS/WHO)**.

## Funcionalidades

Atualmente, o aplicativo possui:

- Tela inicial de acesso;
- Entrada por telefone ou e-mail em modo demonstrativo;
- Cálculo de IMC;
- Data de nascimento para cálculo automático da idade;
- Seleção de sexo;
- Classificação de IMC para adultos;
- Classificação pediátrica baseada na WHO Growth Reference 2007;
- Validação dos dados informados;
- Compatibilidade planejada para Android e iOS.

A autenticação ainda é demonstrativa. Nesta etapa, nenhum dado de login é enviado ou armazenado em banco de dados.

## Avaliação por faixa etária

O protocolo utilizado pelo aplicativo é definido automaticamente a partir da data de nascimento.

| Faixa etária | Avaliação disponível |
| --- | --- |
| Menores de 5 anos | Ainda não disponível |
| 61 a 228 meses completos | WHO Growth Reference 2007 – BMI-for-age |
| 20 a 59 anos | Classificação adulta |
| 60 anos ou mais | Ainda não disponível |

Nas faixas ainda não suportadas, o aplicativo informa que a avaliação não está disponível e não apresenta IMC ou classificação.

### Crianças e adolescentes

Para a avaliação pediátrica, o projeto utiliza a **WHO Growth Reference 2007**, considerando idade e sexo.

A cobertura utilizada atualmente corresponde a **61 a 228 meses completos**. O aplicativo não extrapola os dados da OMS e não utiliza a classificação adulta quando a idade estiver fora dessa cobertura.

Os coeficientes necessários para o cálculo são armazenados localmente, permitindo que a avaliação seja realizada sem consultar uma API externa.

A metodologia, origem dos dados, limites da implementação e validação estão documentados em:

`docs/WHO2007.md`

### Adultos

Para pessoas entre 20 e 59 anos, a classificação utilizada é:

| IMC | Classificação |
| --- | --- |
| < 18,5 | Baixo peso |
| ≥ 18,5 e < 25 | Peso adequado |
| ≥ 25 e < 30 | Sobrepeso |
| ≥ 30 e < 35 | Obesidade grau I |
| ≥ 35 e < 40 | Obesidade grau II |
| ≥ 40 | Obesidade grau III |

O valor completo do IMC é utilizado para a classificação antes do arredondamento exibido na tela.

## Referências da OMS

As regras relacionadas ao IMC são baseadas em documentos e dados oficiais da **World Health Organization (WHO)**.

Principais referências utilizadas:

- WHO Growth Reference Data for 5–19 years;
- WHO BMI-for-age (5–19 years);
- WHO Application Tools;
- dados LMS disponibilizados pela WHO para BMI-for-age.

Referências oficiais:

- https://www.who.int/tools/growth-reference-data-for-5to19-years
- https://www.who.int/toolkits/growth-reference-data-for-5to19-years/indicators/bmi-for-age
- https://www.who.int/tools/growth-reference-data-for-5to19-years/application-tools

Mais detalhes sobre a implementação pediátrica podem ser encontrados em:

`docs/WHO2007.md`

## Tecnologias

O projeto utiliza:

- JavaScript
- React
- React Native
- Expo
- Node.js
- npm
- Git
- GitHub

Principais versões utilizadas atualmente:

| Tecnologia | Versão |
| --- | --- |
| React | 19.2.3 |
| React Native | 0.86.3 |
| Expo | ~57.0.24 |

## Android e iOS

O aplicativo está sendo desenvolvido com suporte planejado para:

- **Android** — futura distribuição pela Google Play Store;
- **iOS** — futura distribuição pela Apple App Store.

Novas funcionalidades devem manter compatibilidade com as duas plataformas.

A publicação nas lojas ainda não faz parte da versão atual.

## Como executar o projeto

### Pré-requisitos

Tenha instalado:

- Node.js;
- npm;
- Git;
- Expo Go no dispositivo utilizado para testes.

### Clonar o repositório

```bash
git clone https://github.com/Giuliano-Bussolotto/calculadora_imc_Curricularizacao.git
```

Entre na pasta:

```bash
cd calculadora_imc_Curricularizacao
```

### Instalar as dependências

```bash
npm ci
```

### Executar

```bash
npm start
```

O Expo exibirá um QR Code que pode ser utilizado para abrir o aplicativo no Expo Go.

## Testes

Os testes automatizados podem ser executados com:

```bash
npm test
```

Os testes verificam, entre outros pontos:

- cálculo do IMC;
- validação das entradas;
- cálculo da idade;
- classificação adulta;
- limites das faixas etárias;
- classificação pediátrica WHO 2007;
- navegação e comportamento das telas.

A implementação pediátrica também é comparada com resultados oficiais da OMS armazenados como referência de teste.

Os testes automatizados não substituem a validação da interface em dispositivos Android e iOS.

## Estrutura do projeto

```text
src/
├── components/
├── data/
│   └── who2007/
├── domain/
│   └── imc/
├── navigation/
└── screens/

docs/
└── WHO2007.md

tests/
├── app.test.cjs
├── imc.test.cjs
└── fixtures/
```

As regras de cálculo e classificação ficam separadas da interface dentro de `src/domain/imc/`.

Os dados necessários para a referência WHO 2007 ficam em `src/data/who2007/`.

## Próximas etapas

O projeto continuará evoluindo gradualmente. Entre as funcionalidades planejadas estão:

- autenticação real de usuários;
- cadastro de pacientes;
- integração com banco de dados;
- histórico de avaliações;
- perfis e permissões para pacientes e profissionais;
- conteúdo e recomendações da clínica;
- notificações;
- suporte futuro às faixas etárias ainda não implementadas;
- publicação para Android e iOS.

## Observação

Este projeto ainda está em desenvolvimento.

As classificações relacionadas à saúde são implementadas a partir das referências documentadas no projeto, mas novas funcionalidades e protocolos devem ser revisados e validados antes do uso em ambiente clínico.
## Design e protótipo
O protótipo de interface e o fluxo de navegação foram desenvolvidos no Penpot.
[Visualizar o protótipo no Penpot](https://design.penpot.app/#/view?file-id=d8ac01df-6646-81d2-8008-acf1ccf778f9&page-id=8f3740fe-e550-8043-8008-acf707895cc5&section=interactions&index=0&share-id=f356ff39-5288-4ecf-898d-e699e2e55ce6)
