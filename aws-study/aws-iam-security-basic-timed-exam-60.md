# AWS IAM e seguranca basica - simulado cronometrado

Material original de treino no estilo SAA-C03, focado em IAM e seguranca basica. Use os exemplos locais apenas como referencia de formato; as questoes abaixo foram criadas do zero.

## Como usar

- Total: 60 questoes.
- Formato: 3 blocos de 20 questoes.
- Tempo sugerido: 40 minutos por bloco, aproximadamente 2 minutos por questao.
- Alvo: concluir as 60 questoes e revisar o gabarito comentado depois.
- Recomendacao: nao leia o gabarito antes de terminar cada bloco.

## Bloco 1 - IAM essencial

### Questao 1

Uma empresa acabou de criar uma nova conta AWS. O time de seguranca quer reduzir o risco do usuario root sem impedir tarefas administrativas raras que exigem esse usuario.

Qual acao atende melhor a esse objetivo?

A. Criar access keys para o usuario root e guarda-las no cofre corporativo.  
B. Habilitar MFA no usuario root, nao criar access keys e usar o root somente para tarefas que exigem root.  
C. Criar um usuario IAM chamado root-admin com a policy AdministratorAccess e remover o MFA do root.  
D. Compartilhar a senha do root entre dois administradores para reduzir dependencia de uma pessoa.

### Questao 2

Uma aplicacao em Amazon EC2 precisa ler objetos de um bucket S3. A equipe quer evitar credenciais de longo prazo dentro da instancia.

Qual solucao e mais adequada?

A. Criar access keys de um usuario IAM e salva-las em um arquivo no disco da instancia.  
B. Anexar uma IAM role a instancia por meio de um instance profile com permissao minima para o bucket.  
C. Inserir a secret access key em uma variavel de ambiente no script de inicializacao.  
D. Criar uma bucket policy publica para permitir leitura anonima dos objetos.

### Questao 3

Um usuario IAM tem uma policy que permite `s3:GetObject` em um bucket. Outra policy anexada ao mesmo usuario contem `Deny` explicito para `s3:GetObject` no mesmo bucket.

Qual sera o resultado?

A. O acesso sera permitido porque uma policy Allow existe.  
B. O acesso sera negado porque Deny explicito prevalece sobre Allow.  
C. O acesso sera permitido se o bucket estiver na mesma conta.  
D. O acesso sera negado somente se houver uma SCP anexada a conta.

### Questao 4

Na mesma conta AWS, uma role tem uma policy de identidade permitindo `sqs:SendMessage` em uma fila. A fila tambem tem uma resource-based policy permitindo a mesma acao para a role.

Como a AWS avalia essas duas policies?

A. Usa somente a policy de identidade e ignora a resource-based policy.  
B. Usa somente a resource-based policy e ignora a policy de identidade.  
C. Considera a uniao dos Allows, exceto se existir Deny explicito.  
D. Considera a intersecao dos Allows, mesmo sem permissions boundary.

### Questao 5

Uma empresa permite que times de aplicacao criem roles IAM, mas quer limitar o maximo de permissoes que essas roles podem receber.

Qual recurso deve ser usado?

A. IAM permissions boundary.  
B. IAM access key rotation.  
C. AWS Shield Standard.  
D. Amazon GuardDuty.

### Questao 6

Uma organizacao usa varias contas AWS. O time central quer impedir que qualquer conta de uma OU desative CloudTrail, mesmo que um administrador local tenha `AdministratorAccess`.

Qual controle e mais apropriado?

A. Uma IAM group policy na conta de gerenciamento.  
B. Uma service control policy (SCP) anexada a OU.  
C. Uma bucket policy no bucket de logs.  
D. Uma permissions boundary anexada ao usuario root.

### Questao 7

Uma empresa usa AWS Organizations. Um bucket S3 deve aceitar acesso somente de principals que pertencem a organizacao, sem listar cada conta individualmente.

Qual condition key atende melhor a esse requisito?

A. `aws:SourceIp`  
B. `aws:username`  
C. `s3:x-amz-acl`  
D. `aws:PrincipalOrgID`

### Questao 8

Uma empresa quer exigir MFA para uma acao sensivel executada por usuarios IAM, como excluir objetos de um bucket especifico.

Qual abordagem e mais apropriada?

A. Criar uma nova access key para cada usuario que tiver MFA.  
B. Habilitar S3 Transfer Acceleration no bucket.  
C. Usar uma condicao IAM relacionada a MFA e negar a acao quando MFA nao estiver presente.  
D. Usar somente uma tag `mfa=true` no bucket, sem policy.

### Questao 9

Uma empresa quer gerenciar acesso humano a varias contas AWS com login centralizado e credenciais temporarias.

Qual servico e recomendado para esse caso?

A. AWS Secrets Manager.  
B. AWS IAM Identity Center.  
C. Amazon Cognito somente com usuarios locais em cada conta.  
D. Um usuario IAM compartilhado por equipe.

### Questao 10

Uma funcao AWS Lambda precisa gravar itens em uma tabela DynamoDB. A equipe quer seguir minimo privilegio.

Qual configuracao e mais adequada?

A. Colocar uma access key de administrador em variaveis de ambiente da Lambda.  
B. Dar permissao `dynamodb:*` em `*` para todos os usuarios IAM da conta.  
C. Tornar a tabela DynamoDB publica.  
D. Criar uma execution role para a Lambda com permissao somente para as acoes e recursos necessarios no DynamoDB.

### Questao 11

Um desenvolvedor precisa iniciar instancias EC2 com uma role especifica. O time de seguranca quer evitar que ele passe roles privilegiadas para as instancias.

Qual permissao deve ser restringida?

A. `ec2:DescribeInstances`  
B. `sts:GetCallerIdentity`  
C. `iam:GetUser`  
D. `iam:PassRole`

### Questao 12

Uma aplicacao usa um banco Amazon RDS e atualmente armazena usuario e senha em arquivo local. A empresa quer armazenar e rotacionar as credenciais com menor overhead operacional.

Qual solucao deve ser usada?

A. Amazon S3 Standard com versionamento.  
B. AWS CloudFormation Outputs sem criptografia.  
C. AWS Secrets Manager com rotacao configurada.  
D. Um parametro String simples no Systems Manager Parameter Store sem controle de acesso.

### Questao 13

Uma aplicacao precisa armazenar uma configuracao sensivel que nao exige rotacao automatica, mas deve ser criptografada e acessada por IAM.

Qual opcao costuma ser adequada para esse tipo de valor?

A. Um arquivo texto em uma AMI publica.  
B. AWS Systems Manager Parameter Store como `SecureString`.  
C. Um tag de EC2 contendo o segredo.  
D. Um comentario no codigo-fonte.

### Questao 14

Um usuario tem permissao IAM para `s3:GetObject`, mas os objetos do bucket foram criptografados com SSE-KMS usando uma customer managed key. O usuario recebe erro de acesso ao baixar os objetos.

Qual permissao adicional provavelmente esta faltando?

A. `ec2:StartInstances` na conta.  
B. `cloudfront:CreateDistribution` para a chave.  
C. `iam:CreateUser` no bucket.  
D. `kms:Decrypt` permitido pela key policy e/ou IAM policy aplicavel.

### Questao 15

Um arquiteto precisa identificar buckets S3 ou roles que permitem acesso publico ou cross-account inesperado.

Qual servico e mais apropriado?

A. AWS Budgets.  
B. Amazon Inspector somente para imagens de container.  
C. IAM Access Analyzer.  
D. Amazon Route 53 Resolver.

### Questao 16

Uma empresa quer revisar usuarios, roles, policies e credenciais que nao sao mais usados para reduzir superficie de ataque.

Qual recurso da AWS ajuda nessa analise?

A. S3 Transfer Acceleration.  
B. Informacoes de ultimo acesso do IAM e credential reports.  
C. Elastic Load Balancing access logs somente.  
D. AWS Snowball Edge.

### Questao 17

Uma empresa quer permitir que usuarios acessem recursos somente quando a tag do principal `department` corresponder a tag do recurso `department`.

Qual abordagem representa esse modelo?

A. Criar um usuario root por departamento.  
B. Usar senhas iguais para todos os usuarios do departamento.  
C. Habilitar CloudFront em todos os recursos.  
D. ABAC com `aws:PrincipalTag` e tags de recurso em conditions IAM.

### Questao 18

Uma role na conta B deve ser assumida por uma role especifica da conta A.

Quais configuracoes sao necessarias?

A. Somente uma identity policy na conta A, sem trust policy na conta B.  
B. Somente uma security group rule entre as contas.  
C. Trust policy na role da conta B permitindo a role da conta A e permissao na conta A para chamar `sts:AssumeRole`.  
D. Um bucket S3 publico para trocar credenciais.

### Questao 19

Uma empresa contrata um fornecedor externo para assumir uma role em sua conta AWS. O arquiteto quer reduzir risco de confused deputy.

Qual mecanismo deve ser usado?

A. Uma access key do usuario root enviada ao fornecedor.  
B. External ID na trust policy da role.  
C. Uma senha compartilhada por e-mail.  
D. Um security group com porta 443 aberta.

### Questao 20

Instancias EC2 em subnets privadas precisam acessar Amazon S3 sem trafego pela internet.

Qual solucao atende ao requisito com menor overhead?

A. Criar um NAT Gateway e permitir saida para qualquer destino.  
B. Atribuir IP publico as instancias.  
C. Criar um gateway VPC endpoint para S3 e ajustar policies conforme necessario.  
D. Criar um internet gateway e mover as instancias para subnets publicas.

## Bloco 2 - Policies, dados e monitoramento

### Questao 21

Uma funcao Lambda precisa permitir que Amazon EventBridge a invoque quando uma regra for acionada.

Que tipo de permissao normalmente permite que um servico invoque a Lambda?

A. Security group da Lambda com porta 443 aberta.  
B. Uma access key colocada no EventBridge.  
C. Uma SCP permitindo `lambda:InvokeFunction` para todos.  
D. Resource-based policy na funcao Lambda.

### Questao 22

Em IAM roles, qual documento define quem pode assumir a role?

A. Cost allocation tag.  
B. Trust policy.  
C. CloudWatch metric filter.  
D. S3 lifecycle rule.

### Questao 23

Uma aplicacao assume uma role com permissoes amplas, mas uma sessao especifica deve ser limitada a somente leitura em um bucket.

Qual recurso pode restringir as permissoes efetivas daquela sessao assumida?

A. Aumentar o timeout da sessao STS.  
B. Criar uma fila SQS FIFO.  
C. Session policy passada no `AssumeRole`.  
D. Usar EBS fast snapshot restore.

### Questao 24

Uma empresa quer impedir que buckets S3 se tornem publicos por ACLs ou bucket policies acidentais.

Qual recurso deve ser habilitado?

A. S3 Transfer Acceleration.  
B. Amazon Macie somente para todos os objetos.  
C. AWS Storage Gateway.  
D. S3 Block Public Access no nivel de conta e/ou bucket.

### Questao 25

Uma equipe precisa auditar quem chamou APIs IAM e STS, incluindo tentativas de criar access keys.

Qual servico fornece o historico de eventos de API?

A. AWS X-Ray.  
B. AWS CloudTrail.  
C. Amazon Route 53.  
D. AWS Backup.

### Questao 26

Uma empresa quer deteccao gerenciada de atividades suspeitas, como uso anomalo de credenciais ou chamadas de API incomuns.

Qual servico e mais apropriado?

A. AWS CloudFormation.  
B. Amazon Athena somente.  
C. Amazon GuardDuty.  
D. Elastic Beanstalk.

### Questao 27

Uma organizacao quer centralizar achados de seguranca e avaliar conformidade com boas praticas e standards.

Qual servico atende melhor a esse objetivo?

A. Amazon SQS.  
B. AWS DataSync.  
C. Amazon CloudFront.  
D. AWS Security Hub.

### Questao 28

Uma equipe quer monitorar continuamente se o root tem MFA habilitado e se buckets S3 estao publicos.

Qual servico pode avaliar recursos contra regras de configuracao?

A. AWS Config.  
B. Amazon EFS.  
C. AWS Step Functions.  
D. Amazon Kinesis Data Streams.

### Questao 29

Uma aplicacao serverless precisa recuperar uma API key sensivel em tempo de execucao. A chave deve ser criptografada e o acesso deve ser controlado por IAM.

Qual abordagem e mais segura?

A. Colocar a chave no repositorio Git privado.  
B. Armazenar a chave no AWS Secrets Manager e permitir leitura apenas para a execution role.  
C. Inserir a chave no nome da funcao Lambda.  
D. Gravar a chave em logs do CloudWatch.

### Questao 30

Um sistema legado fora da AWS ainda exige access keys de IAM user. A empresa nao consegue migrar imediatamente para roles.

Qual pratica reduz risco enquanto a migracao nao acontece?

A. Usar a access key do root para evitar criar usuarios.  
B. Compartilhar a mesma key com todos os ambientes.  
C. Rotacionar access keys quando necessario, monitorar uso e remover keys nao usadas.  
D. Desabilitar CloudTrail para reduzir logs.

### Questao 31

Um administrador quer reduzir permissoes excessivas de uma role que esta em producao ha meses.

Qual abordagem ajuda a gerar uma policy mais proxima de minimo privilegio?

A. Trocar a senha do usuario root.  
B. Usar S3 Glacier Deep Archive.  
C. Aumentar o tamanho da instancia EC2.  
D. Usar IAM Access Analyzer com atividade registrada no CloudTrail.

### Questao 32

Uma equipe comeca um novo workload e usa uma AWS managed policy para acelerar o desenvolvimento. Antes de ir para producao, quer reduzir permissoes.

Qual proximo passo e mais alinhado a boas praticas IAM?

A. Criar customer managed policies especificas com acoes, recursos e conditions necessarias.  
B. Manter `AdministratorAccess` permanentemente para simplificar suporte.  
C. Remover todas as policies e usar somente security groups.  
D. Criar access keys para cada container.

### Questao 33

Um bucket S3 deve aceitar acesso somente quando as chamadas vierem por um VPC endpoint especifico.

Qual condition key e mais adequada em uma bucket policy?

A. `aws:UserAgent` sem restricoes adicionais  
B. `aws:SourceVpce`  
C. `aws:RequestedRegion` somente  
D. `ec2:InstanceType`

### Questao 34

Uma empresa quer negar qualquer acesso S3 que nao use HTTPS/TLS.

Qual condition costuma ser usada em bucket policies para esse controle?

A. `s3:VersionId` igual a `null` em uma declaracao `Allow`.  
B. `aws:PrincipalOrgID` com valor vazio.  
C. `aws:SecureTransport` igual a `false` em uma declaracao `Deny`.  
D. `kms:KeySpec` igual a `RSA_4096`.

### Questao 35

Uma customer managed KMS key nao permite uso por uma role, embora a role tenha uma IAM policy com `kms:Decrypt`.

Qual ponto deve ser verificado primeiro?

A. Se a tabela DynamoDB tem Auto Scaling.  
B. Se o bucket S3 usa Transfer Acceleration.  
C. Se o usuario root tem uma access key ativa.  
D. Se a key policy permite que a conta/role use IAM policies ou concede acesso diretamente.

### Questao 36

Uma empresa criou uma KMS key na regiao `us-east-1`. Uma aplicacao em outra regiao tenta usar a mesma key diretamente.

Qual afirmacao e correta?

A. KMS key policies sao regionais e controlam chaves na mesma regiao.  
B. Uma KMS key sempre e global e funciona automaticamente em todas as regioes.  
C. IAM ignora a regiao quando avalia KMS.  
D. SCPs copiam KMS keys para todas as regioes.

### Questao 37

Uma aplicacao roda em Amazon ECS em instancias EC2. Cada task precisa de permissoes diferentes para recursos AWS.

Qual solucao segue melhor o principio de minimo privilegio?

A. Usar uma unica role EC2 altamente privilegiada para todas as tasks.  
B. Usar task roles diferentes para cada task/servico.  
C. Colocar access keys em variaveis de ambiente de cada container.  
D. Tornar os recursos publicos para evitar IAM.

### Questao 38

Uma API publica chama uma funcao Lambda por meio do Amazon API Gateway. A Lambda nao deve aceitar invocacao direta de qualquer principal aleatorio.

Qual configuracao ajuda a controlar isso?

A. Uma rota publica no Route 53.  
B. Um bucket S3 publico contendo o ARN da Lambda.  
C. Resource-based policy da Lambda permitindo invocacao somente pelo API Gateway esperado.  
D. Uma NACL permitindo portas efemeras.

### Questao 39

Uma aplicacao precisa permitir que um usuario baixe um objeto S3 privado por tempo limitado, sem tornar o bucket publico.

Qual opcao e mais apropriada?

A. Desabilitar Block Public Access do bucket inteiro.  
B. Adicionar `Principal: "*"` com `s3:GetObject` permanente.  
C. Enviar a secret access key ao usuario.  
D. Gerar uma URL pre-assinada com expiracao curta usando uma identidade autorizada.

### Questao 40

Um administrador adiciona uma bucket policy publica para `s3:GetObject`, mas S3 Block Public Access esta habilitado no nivel da conta.

Qual resultado e esperado?

A. O acesso publico sera bloqueado pela configuracao mais restritiva.  
B. A bucket policy sempre prevalece sobre Block Public Access.  
C. O bucket sera publico apenas na regiao primaria.  
D. O acesso sera permitido se o objeto tiver SSE-S3.

## Bloco 3 - Controles praticos de seguranca

### Questao 41

Um time de plataforma quer permitir que desenvolvedores criem roles para suas aplicacoes, mas nunca acima de um conjunto maximo aprovado de permissoes.

Qual design e mais adequado?

A. Dar o usuario root a todos os desenvolvedores.  
B. Delegar criacao de roles exigindo uma permissions boundary aprovada.  
C. Criar uma unica role `AdminApp` para todos os sistemas.  
D. Usar somente tags de custo sem IAM policies.

### Questao 42

Uma empresa quer negar `cloudtrail:StopLogging` e `cloudtrail:DeleteTrail` em todas as contas de uma OU.

Onde essa restricao central deve ser aplicada?

A. Em cada security group de EC2.  
B. Em uma lifecycle policy de S3.  
C. Em uma SCP anexada a OU.  
D. Em uma route table publica.

### Questao 43

Uma organizacao usa AWS IAM Identity Center. Como o acesso a contas AWS normalmente e materializado para usuarios federados?

A. Por access keys permanentes do root em cada conta.  
B. Por bucket policies publicas.  
C. Por senhas locais criadas manualmente em todas as contas.  
D. Por permission sets que provisionam roles e credenciais temporarias nas contas alvo.

### Questao 44

Uma empresa guarda backups criticos no S3 e quer protecao contra exclusao maliciosa ou acidental durante um periodo de retencao.

Qual recurso e mais adequado?

A. S3 Object Lock com modo e periodo de retencao apropriados.  
B. S3 Transfer Acceleration.  
C. Uma tag `backup=true` sem policy.  
D. Reduzir a duracao das sessoes STS.

### Questao 45

Uma empresa quer garantir criptografia de novos volumes EBS sem depender de cada time lembrar de selecionar a opcao manualmente.

Qual configuracao e mais apropriada?

A. Criar uma access key para cada volume.  
B. Habilitar EBS encryption by default na conta/regiao.  
C. Habilitar S3 Block Public Access.  
D. Adicionar uma regra de entrada no security group.

### Questao 46

Um arquiteto compara security groups e network ACLs para uma VPC.

Qual afirmacao esta correta?

A. Security groups sao stateless; network ACLs sao stateful.  
B. Ambos sao sempre globais e nao pertencem a VPC.  
C. Security groups sao stateful; network ACLs sao stateless.  
D. Nenhum dos dois controla trafego de rede.

### Questao 47

Uma aplicacao publica precisa de protecao gerenciada contra padroes comuns de ataques web, como SQL injection e XSS.

Qual servico deve ser considerado?

A. AWS DataSync.  
B. Amazon EBS.  
C. AWS Glue.  
D. AWS WAF.

### Questao 48

Uma aplicacao usa CloudFront e Application Load Balancer. A empresa quer protecao basica contra ataques DDoS comuns sem contratar um plano adicional.

Qual recurso ja oferece protecao padrao?

A. AWS Shield Standard.  
B. AWS Snowmobile.  
C. AWS Batch.  
D. AWS CodeCommit.

### Questao 49

Uma aplicacao em VPC privada precisa chamar um servico AWS suportado sem passar pela internet publica.

Qual recurso geralmente atende esse padrao?

A. Internet gateway obrigatorio em todas as subnets.  
B. VPC endpoint, gateway ou interface dependendo do servico.  
C. Um IP publico em cada instancia.  
D. Uma public hosted zone no Route 53.

### Questao 50

Uma access key de IAM user foi exposta publicamente.

Qual e a resposta inicial mais adequada?

A. Esperar a key expirar automaticamente.  
B. Aumentar as permissoes da key para facilitar auditoria.  
C. Desativar a key, criar/substituir credenciais se necessario, investigar uso em CloudTrail e reduzir permissoes.  
D. Criar uma copia da key em outro usuario.

### Questao 51

Um administrador precisa fazer tarefas diarias, como criar usuarios, revisar logs e ajustar permissoes.

Qual pratica e mais segura?

A. Usar sempre o usuario root para todas as tarefas.  
B. Compartilhar uma conta IAM entre administradores.  
C. Desabilitar MFA para acelerar o acesso.  
D. Usar uma identidade administrativa federada/role com MFA, nao o usuario root.

### Questao 52

Uma policy IAM contem `Action: "*"`, `Resource: "*"`, e esta anexada a uma role de aplicacao em producao.

Qual e a principal preocupacao?

A. A policy viola minimo privilegio e aumenta impacto de comprometimento da role.  
B. A policy impede qualquer acesso por padrao.  
C. A policy funciona apenas com S3 e nao afeta outros servicos.  
D. A policy transforma automaticamente a role em usuario root.

### Questao 53

Uma empresa quer separar ambientes de desenvolvimento, homologacao e producao em contas distintas e aplicar guardrails diferentes por ambiente.

Qual estrutura e mais apropriada?

A. Uma unica conta com todos usando root.  
B. AWS Organizations com OUs e SCPs por ambiente.  
C. Um bucket S3 diferente para cada senha.  
D. Uma unica subnet publica para todos os workloads.

### Questao 54

Uma empresa quer criar um data perimeter simples para um bucket S3: principals devem pertencer a organizacao e trafego deve vir por um VPC endpoint aprovado.

Quais conditions combinadas ajudam nesse objetivo?

A. `ec2:InstanceType` e `s3:VersionId`.  
B. `kms:KeySpec` e `cloudfront:ViewerCountry`.  
C. `aws:PrincipalOrgID` e `aws:SourceVpce`.  
D. `aws:UserAgent` apenas.

### Questao 55

Uma fila SQS usa SSE-KMS com uma customer managed key. Produtores autorizados recebem erro de KMS ao enviar mensagens.

O que deve ser verificado?

A. Se a fila e FIFO.  
B. Se a fila tem delay de 0 segundos.  
C. Se a fila tem uma dead-letter queue.  
D. Se IAM/key policy permitem as acoes KMS necessarias para o uso da chave pela fila e pelos principals envolvidos.

### Questao 56

Uma empresa quer reduzir risco de adulteracao dos logs de auditoria.

Qual combinacao e mais adequada?

A. CloudTrail enviando logs para S3 protegido, com acesso restrito, criptografia e controles de retencao/imutabilidade quando necessario.  
B. CloudTrail desabilitado para evitar custo.  
C. Logs em arquivo local de uma instancia publica.  
D. Permitir `s3:DeleteObject` para todos os usuarios no bucket de logs.

### Questao 57

Um time de seguranca quer investigar atividades suspeitas correlacionando achados, entidades e comportamento em uma conta AWS.

Qual servico pode ajudar na investigacao depois que achados sao gerados?

A. Amazon S3 Glacier.  
B. Amazon Detective.  
C. AWS Snowball.  
D. Amazon MQ.

### Questao 58

Uma empresa precisa rotacionar credenciais de banco em multiplas regioes com menor overhead.

Qual solucao e mais adequada?

A. Um arquivo `.env` copiado manualmente para cada regiao.  
B. Uma access key do root usada pela aplicacao.  
C. AWS Secrets Manager com replicacao multi-regiao do segredo e rotacao configurada.  
D. Um parametro publico no CloudFormation.

### Questao 59

Administradores acessam instancias EC2 para troubleshooting. A empresa quer reduzir exposicao de SSH publico.

Qual solucao e mais segura e gerenciada?

A. Abrir porta 22 para `0.0.0.0/0`.  
B. Colocar a chave privada SSH em um bucket publico.  
C. Criar um usuario IAM para login SSH direto.  
D. Usar AWS Systems Manager Session Manager e remover acesso SSH publico quando possivel.

### Questao 60

Uma empresa quer receber alerta quando o usuario root for usado na conta.

Qual solucao tem baixo overhead operacional?

A. Criar uma regra do Amazon EventBridge baseada em eventos do CloudTrail para uso do root e enviar notificacao por SNS.  
B. Criar uma tabela DynamoDB chamada `root-alerts` sem integra-la a eventos.  
C. Desabilitar CloudTrail para evitar falsos positivos.  
D. Usar S3 Transfer Acceleration no bucket de logs.

## Gabarito comentado

1. B - Proteja o root com MFA, evite access keys e use-o apenas para tarefas que exigem root.
2. B - Roles para EC2 fornecem credenciais temporarias via instance profile, sem distribuir secrets de longo prazo.
3. B - Deny explicito sempre prevalece sobre Allow.
4. C - Identity-based e resource-based policies na mesma conta formam uma uniao de Allows, salvo Deny explicito.
5. A - Permissions boundaries limitam o maximo que uma identity-based policy pode conceder.
6. B - SCPs criam guardrails centrais em Organizations e podem limitar ate administradores locais.
7. D - `aws:PrincipalOrgID` evita listar todas as contas da organizacao.
8. C - Conditions de MFA em policies ajudam a exigir MFA para acoes sensiveis.
9. B - IAM Identity Center centraliza acesso humano e usa roles/credenciais temporarias.
10. D - Lambda usa execution role; minimo privilegio limita acoes e recursos.
11. D - `iam:PassRole` controla quais roles um principal pode passar a servicos como EC2.
12. C - Secrets Manager e indicado para segredos com rotacao, especialmente credenciais de banco.
13. B - Parameter Store `SecureString` e adequado para configuracoes sensiveis sem rotacao automatica obrigatoria.
14. D - Para SSE-KMS, a identidade tambem precisa de permissoes KMS aplicaveis, como `kms:Decrypt`.
15. C - IAM Access Analyzer identifica acesso publico e cross-account inesperado em recursos suportados.
16. B - Last accessed e credential reports ajudam a remover identidades, permissoes e credenciais nao usadas.
17. D - ABAC usa atributos/tags para controlar acesso dinamicamente.
18. C - Cross-account assume role exige trust no destino e permissao para `sts:AssumeRole` na origem.
19. B - External ID ajuda a mitigar confused deputy com terceiros.
20. C - Gateway endpoint para S3 permite acesso privado sem internet.
21. D - Lambda usa resource-based policy para permitir invocacao por servicos como EventBridge ou API Gateway.
22. B - Trust policy define quais principals podem assumir a role.
23. C - Session policies reduzem permissoes efetivas de uma sessao STS.
24. D - S3 Block Public Access bloqueia configuracoes que tornariam recursos publicos.
25. B - CloudTrail registra chamadas de API e eventos de gerenciamento.
26. C - GuardDuty detecta atividade suspeita e uso anomalo de credenciais.
27. D - Security Hub centraliza achados e avaliacoes de seguranca.
28. A - AWS Config avalia configuracoes contra regras gerenciadas ou customizadas.
29. B - Secrets Manager protege segredos e IAM controla quem pode le-los.
30. C - Quando keys longas forem inevitaveis, monitore, rotacione e remova o que nao for usado.
31. D - IAM Access Analyzer pode gerar policies com base em atividade registrada no CloudTrail.
32. A - Customer managed policies especificas ajudam a sair de permissoes amplas.
33. B - `aws:SourceVpce` restringe chamadas a um endpoint especifico.
34. C - Um Deny com `aws:SecureTransport=false` bloqueia acesso sem TLS.
35. D - KMS exige permissao efetiva na key policy; IAM Allow sozinho pode nao bastar.
36. A - KMS keys e key policies sao regionais.
37. B - ECS task roles permitem permissoes granulares por task.
38. C - Lambda resource-based policy limita quem pode invocar a funcao.
39. D - URL pre-assinada concede acesso temporario sem tornar o bucket publico.
40. A - Block Public Access aplica a configuracao mais restritiva e pode bloquear policy publica.
41. B - Boundaries permitem delegar criacao de roles com limite maximo aprovado.
42. C - SCP na OU e o controle central adequado para negar acoes em contas membros.
43. D - Permission sets do IAM Identity Center provisionam roles e sessoes temporarias.
44. A - S3 Object Lock protege objetos contra alteracao/exclusao durante retencao.
45. B - EBS encryption by default reduz dependencia de configuracao manual por workload.
46. C - Security groups sao stateful; NACLs sao stateless.
47. D - AWS WAF protege contra padroes comuns de ataque web.
48. A - Shield Standard fornece protecao DDoS padrao para servicos AWS suportados.
49. B - VPC endpoints permitem acesso privado a servicos AWS suportados.
50. C - Key exposta deve ser desativada/rotacionada e investigada imediatamente.
51. D - Tarefas diarias devem usar identidades administrativas federadas/roles com MFA, nao root.
52. A - `*` em acao e recurso aumenta o blast radius e viola minimo privilegio.
53. B - Organizations com OUs e SCPs permite separar ambientes e aplicar guardrails.
54. C - `aws:PrincipalOrgID` e `aws:SourceVpce` ajudam a combinar perimetro de identidade e rede.
55. D - SSE-KMS exige permissoes KMS corretas nas policies envolvidas.
56. A - Logs de auditoria devem ficar em armazenamento protegido, criptografado e com retencao forte.
57. B - Amazon Detective ajuda a investigar e correlacionar comportamento suspeito.
58. C - Secrets Manager suporta rotacao e replicacao multi-regiao de segredos.
59. D - Session Manager reduz necessidade de SSH publico e chaves espalhadas.
60. A - CloudTrail + EventBridge + SNS e uma solucao comum e de baixo overhead para alerta de uso do root.

## Referencias oficiais consultadas via AWS Docs MCP

- AWS IAM security best practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- IAM policy evaluation logic: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
- IAM roles for EC2 applications: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html
- IAM Access Analyzer: https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html
- Root user best practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html
- S3 Block Public Access: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
- AWS KMS key policies: https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html
- AWS Organizations SCP examples: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_examples.html
- AWS Secrets Manager rotation strategies: https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotation-strategy.html
