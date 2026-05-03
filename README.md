# AWS Cert Trainer

Aplicacao local para treinar simulados estilo AWS Certification.

- Frontend Angular com Dashboard, Simulado, Temas e Historico.
- Backend NestJS em camadas MVC, services, repositories e adapters.
- Login com sessao Bearer token para proteger temas, tentativas e progresso.
- Prisma ORM com Postgres para usuarios, sessoes, temas, perguntas e respostas.
- Adapter Markdown para seed inicial em `aws-study/aws-iam-security-basic-timed-exam-60.md`.
- Adapter CSV compativel com Excel para importar novas perguntas por tema.
- Cada usuario ve seus temas, temas compartilhados e seu proprio progresso.

## Rodar localmente

Suba o Postgres do projeto:

```bash
docker compose up -d postgres
```

Prepare o backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

Em outro terminal, rode o frontend:

```bash
cd frontend
npm install
npm start
```

- Frontend: http://localhost:4200
- Backend NestJS: http://localhost:3000
- Postgres: `localhost:5433`
- Prisma Studio: `cd backend && npm run prisma:studio`

## Importar perguntas

Abra `http://localhost:4200/temas`, baixe o modelo CSV compativel com Excel e preencha as colunas:

`bloco`, `titulo_bloco`, `pergunta`, `alternativa_a`, `alternativa_b`, `alternativa_c`, `alternativa_d`, `resposta_correta`, `explicacao`, `tempo_bloco_minutos`.

Depois selecione ou crie um tema e envie a planilha.

## Usuarios e compartilhamento

O app usa cadastro/login com email e senha. A API valida `Authorization: Bearer <token>` em rotas de temas, simulados e progresso.

- Temas criados pelo usuario ficam privados por padrao.
- Um tema proprio pode ser marcado como compartilhado em `Temas`.
- Outros usuarios conseguem estudar temas compartilhados, mas so o dono pode importar/substituir questoes.
- Tentativas, respostas e historico de progresso ficam isolados por usuario.
