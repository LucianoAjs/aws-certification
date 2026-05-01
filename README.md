# AWS Cert Trainer

Aplicacao local para treinar simulados estilo AWS Certification.

- Frontend Angular com Dashboard, Simulado, Temas e Historico.
- Backend NestJS em camadas MVC, services, repositories e adapters.
- SQLite local para temas, perguntas, tentativas, respostas e progresso.
- Adapter Markdown para seed inicial em `aws-study/aws-iam-security-basic-timed-exam-60.md`.
- Adapter CSV compativel com Excel para importar novas perguntas por tema.

## Rodar localmente

Em um terminal:

```bash
cd backend
npm start
```

Em outro terminal:

```bash
cd frontend
npm start
```

- Frontend: http://localhost:4200
- Backend NestJS: http://localhost:3333
- SQLite: `backend/data/trainer.sqlite`

## Importar perguntas

Abra `http://localhost:4200/temas`, baixe o modelo CSV compativel com Excel e preencha as colunas:

`bloco`, `titulo_bloco`, `pergunta`, `alternativa_a`, `alternativa_b`, `alternativa_c`, `alternativa_d`, `resposta_correta`, `explicacao`, `tempo_bloco_minutos`.

Depois selecione ou crie um tema e envie a planilha.
