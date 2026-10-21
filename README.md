# Organizador de imagens para Google Forms

Aplicação React e Express para ler capas de jogos em uma pasta mensal do Google Drive, revisar editora e jogo, e preparar os dados para a criação de um Google Forms.

## Pré-requisitos

- Node.js 20 ou superior
- Uma conta Google com acesso de leitura à pasta raiz e às pastas mensais

## Configuração do Google Cloud

1. Crie ou selecione um projeto no [Google Cloud Console](https://console.cloud.google.com/).
2. Em **APIs e serviços > Biblioteca**, habilite **Google Drive API** e **Google Forms API**.
3. Em **Tela de consentimento OAuth**, configure o aplicativo como externo ou interno, inclua seu e-mail em usuários de teste quando necessário e adicione os escopos `.../auth/drive.readonly` e `.../auth/forms.body`.
4. Em **Credenciais**, crie uma credencial **ID do cliente OAuth** do tipo **Aplicativo da Web**.
5. Cadastre `http://localhost:3001/auth/google/callback` como URI de redirecionamento autorizado.
6. Copie `.env.example` para `.env`, preencha o ID e segredo do cliente e o ID da pasta raiz. O ID está na URL da pasta do Drive.

## Executando localmente

```bash
npm install
npm run dev:server
```

Em outro terminal:

```bash
npm run dev
```

Abra `http://localhost:5173`, use o login em `http://localhost:3001/auth/google` e volte ao aplicativo. O servidor mantém os tokens apenas em memória: reiniciá-lo exige uma nova autenticação.

```bash
npm test
npm run build
```

## Organização esperada no Drive

Defina `GOOGLE_DRIVE_ROOT_FOLDER_ID` para a pasta que contém as pastas mensais. Arquivos de imagem devem seguir `Editora - Jogo.ext`. PNG, JPEG, WEBP e GIF são aceitos. O parser separa apenas o primeiro ` - `; portanto, hífens no título do jogo permanecem intactos.

Edições feitas no app são armazenadas no `localStorage` por pasta/mês. Elas não alteram os arquivos no Drive.

## Parte 2: imagens no Forms

A rota `POST /api/forms` e o `FormsService` são propositalmente um limite de integração ainda não implementado. A Forms API cria o formulário primeiro e recebe seções/itens em `batchUpdate`.

Itens de imagem exigem `sourceUri` acessível publicamente; `thumbnailLink` e links autenticados do Drive não são uma solução confiável. A alternativa recomendada é copiar as capas para um armazenamento controlado com URLs públicas temporárias (por exemplo, Cloud Storage), criar o formulário em batches e remover/restringir os objetos depois. Isso reduz exposição permanente e é compatível com a API, ao custo de armazenamento e uma etapa extra. Tornar arquivos do Drive públicos é mais simples, mas altera permissões dos originais; Apps Script evita um serviço adicional, mas introduz limites e menor controle operacional. A decisão final deve ser confirmada antes da implementação da Parte 2.
