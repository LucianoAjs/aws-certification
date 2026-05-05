# AWS EC2 Fundamentals - simulado cronometrado

Material original de treino no estilo SAA-C03, focado na Secao 5: EC2 Fundamentals. Use os exemplos locais apenas como referencia de formato; as questoes abaixo foram criadas do zero com apoio da documentacao oficial da AWS e dos materiais locais informados.

## Como usar

- Total: 85 questoes.
- Formato: 5 blocos de 17 questoes.
- Tempo sugerido: 24 minutos por bloco, fechando 2 horas de questoes cronometradas.
- Alvo: seguir a ordem da secao do curso: budget, EC2 basics, user data, instance types, security groups, SSH, roles, purchasing options e quiz.
- Recomendacao: responda cada bloco antes de olhar o gabarito comentado.

## Tabela EC2 de revisao

| Tema | Quando usar | Pegadinhas SAA-C03 |
| --- | --- | --- |
| General purpose | Workloads equilibrados de CPU, memoria e rede, como web apps e ambientes pequenos. | Nao escolha compute ou memory optimized sem gargalo claro. |
| Compute optimized | Processamento intenso, batch, HPC leve, servidores de aplicacao com CPU alta. | Se o gargalo for memoria, a familia compute nao resolve. |
| Memory optimized | Bancos em memoria, caches, analytics e workloads com grande dataset em RAM. | Custo maior precisa ser justificado por pressao de memoria. |
| Storage optimized | I/O local intenso, baixa latencia de disco, data warehousing e processamento local temporario. | Instance store e temporario; dados duraveis devem ir para EBS, EFS, FSx ou S3. |
| Accelerated computing | GPU, inferencia, renderizacao, ML, processamento grafico ou hardware especializado. | Nao confundir aceleracao com aumento generico de CPU. |
| On-Demand | Uso imprevisivel, curto prazo, sem compromisso. | Flexivel, mas normalmente mais caro para baseline 24/7. |
| Savings Plans | Compromisso de gasto por hora por 1 ou 3 anos, com mais flexibilidade que RI em muitos cenarios. | Nao garante capacidade; e desconto de billing. |
| Reserved Instances | Uso previsivel de configuracao especifica por 1 ou 3 anos. | Regional RI da desconto; zonal RI tambem pode reservar capacidade na AZ. |
| Spot Instances | Workloads tolerantes a interrupcao, stateless, batch, filas e capacidade extra barata. | Pode ser interrompido; nao e ideal para estado critico sem tolerancia. |
| Dedicated Hosts | Servidor fisico dedicado para BYOL, licencas por socket/core e compliance. | Diferente de Dedicated Instance; Host da visibilidade e controle do servidor fisico. |
| Capacity Reservations | Garantir capacidade EC2 em uma AZ especifica por qualquer duracao. | Cobra mesmo sem uso; desconto de Savings Plans/RI regional pode aplicar ao billing. |
| Security groups | Firewall stateful com regras allow para ENIs/instancias. | Nao existe regra deny; inbound default vazio, outbound default permite tudo. |
| SG referenciando SG | Permitir trafego entre camadas, como ALB -> web -> DB, sem fixar IPs. | Referenciar um SG nao copia as regras dele; so define origem/destino permitido. |
| User data | Bootstrap no lancamento: instalar pacotes, iniciar servicos, registrar agente. | Linux roda por padrao somente no primeiro boot, como root; nao grave segredos ali. |
| IAM role / instance profile | Dar permissoes temporarias para apps em EC2 chamarem AWS APIs. | No CLI/API, a instancia usa instance profile; nao anexe access keys no servidor. |
| SSH / Session Manager | SSH com key pair quando necessario; Session Manager para acesso gerenciado. | Porta 22 aberta para `0.0.0.0/0` e chave privada espalhada sao sinais de risco. |

## Bloco 1 - Budget e EC2 basics

### Questao 1

Um aluno esta iniciando os laboratorios de EC2 e quer ser avisado antes que os custos mensais passem de um valor definido. Ele tambem quer receber alerta por email ou SNS.

Qual recurso atende melhor a esse objetivo?

A. AWS CloudTrail com trilha somente de eventos de leitura.  
B. Amazon Inspector com scan continuo das instancias.  
C. EC2 Auto Scaling com desired capacity igual a zero.  
D. AWS Budgets com budget de custo e notificacao configurada.

### Questao 2

Uma equipe quer comparar o custo de EC2 dos ultimos meses e identificar quais familias ou tipos de instancia causaram aumento de gasto.

Qual ferramenta e mais adequada para analise com filtros de custo e uso?

A. AWS Systems Manager Session Manager.  
B. EC2 Instance Connect.  
C. Amazon Route 53 Resolver.  
D. AWS Cost Explorer.

### Questao 3

Uma empresa quer acompanhar a utilizacao de Reserved Instances e Savings Plans para saber quando o uso fica abaixo de um alvo.

Qual tipo de budget deve ser considerado?

A. Budget de logs do CloudWatch.  
B. Budget de chaves KMS.  
C. Budget de utilizacao ou cobertura de RI/Savings Plans.  
D. Budget de regras de security group.

### Questao 4

Um laboratorio exige um servidor virtual com sistema operacional, CPU, memoria, rede e armazenamento configuraveis sob demanda.

Qual servico representa esse servidor virtual?

A. Amazon S3.  
B. Amazon DynamoDB.  
C. Amazon Route 53.  
D. Amazon EC2.

### Questao 5

Uma aplicacao precisa de um template pre-configurado para lancar instancias com sistema operacional e softwares base ja instalados.

Qual recurso do EC2 deve ser usado?

A. Placement group.  
B. Security group.  
C. Elastic IP.  
D. Amazon Machine Image (AMI).

### Questao 6

Uma instancia precisa armazenar dados que continuem existindo depois de uma parada e nova inicializacao da instancia.

Qual armazenamento atende melhor a esse requisito?

A. Instance store.  
B. Cache local do navegador.  
C. Memoria RAM da instancia.  
D. Amazon EBS volume.

### Questao 7

Uma aplicacao usa instance store para arquivos temporarios. O time quer entender o risco antes de parar ou terminar a instancia.

Qual afirmacao esta correta?

A. Instance store replica automaticamente os dados para outra Regiao.  
B. Instance store e persistente mesmo apos stop, hibernate ou terminate.  
C. Instance store e adequado para dados temporarios e pode ser perdido quando a instancia para, hiberna ou termina.  
D. Instance store substitui backups em S3 para dados de producao.

### Questao 8

Uma instancia em subnet publica precisa manter o mesmo endereco IPv4 publico mesmo apos stop/start.

Qual recurso deve ser associado a instancia?

A. Private hosted zone.  
B. Network ACL.  
C. IAM instance profile.  
D. Elastic IP address.

### Questao 9

Um time quer identificar todos os recursos EC2 de um projeto para analise de custo e governanca.

Qual pratica ajuda mais nesse objetivo?

A. Aplicar tags consistentes como `Project` e `Environment`.  
B. Abrir SSH para toda a internet.  
C. Usar somente IP publico dinamico.  
D. Remover todas as descricoes das regras de rede.

### Questao 10

Uma empresa quer que uma instancia EC2 seja iniciada em uma subnet privada sem IP publico, mas consiga baixar atualizacoes da internet.

Qual componente normalmente permite saida para a internet sem expor a instancia diretamente?

A. Internet gateway anexado diretamente a instancia privada.  
B. Security group sem regras inbound.  
C. NAT gateway em subnet publica com rotas adequadas.  
D. Elastic IP anexado ao volume EBS.

### Questao 11

Uma aplicacao publica roda em instancias EC2 atras de um Application Load Balancer. A empresa quer distribuir trafego entre instancias em varias AZs.

Qual desenho e mais adequado?

A. Uma unica instancia com IP elastico, sem balanceador.  
B. Instancias em uma unica AZ sem health checks.  
C. Auto Scaling group em multiplas AZs atras de um ALB.  
D. Bucket S3 com RDP habilitado.

### Questao 12

Uma instancia EC2 Linux precisa receber conexoes SSH somente do IP corporativo `203.0.113.10`.

Qual regra de security group e mais adequada?

A. TCP 3389 de `203.0.113.10/32`.  
B. TCP 22 de `0.0.0.0/0`.  
C. UDP 22 de `203.0.113.0/24`.  
D. TCP 22 de `203.0.113.10/32`.

### Questao 13

Um usuario quer executar um teste curto em EC2 sem compromisso de longo prazo, pagando apenas pelo uso.

Qual modelo de compra e mais alinhado?

A. Dedicated Host de 3 anos.  
B. Zonal Reserved Instance de 3 anos.  
C. On-Demand Instance.  
D. Capacity Reservation permanente sem instancia.

### Questao 14

Uma aplicacao precisa de armazenamento compartilhado entre varias instancias EC2 em AZs diferentes, com acesso simultaneo por arquivo.

Qual servico e geralmente indicado?

A. Instance store em cada instancia.  
B. Snapshot EBS montado ao mesmo tempo em todas as instancias.  
C. Elastic IP compartilhado.  
D. Amazon EFS.

### Questao 15

Uma empresa quer clonar rapidamente uma configuracao EC2 padrao para novos ambientes, mantendo SO, pacotes e agentes ja preparados.

Qual abordagem e mais adequada?

A. Criar uma AMI customizada e lancar novas instancias a partir dela.  
B. Copiar a chave privada SSH para cada usuario.  
C. Criar uma regra de NACL para cada pacote instalado.  
D. Usar somente CloudTrail para instalar software.

### Questao 16

Ao criar uma security group nova, uma equipe percebe que nenhuma conexao de entrada chega a instancia.

Qual comportamento padrao explica isso?

A. Security groups novas negam explicitamente todo trafego outbound.  
B. Security groups novas nao possuem regras inbound, entao entrada nao e permitida ate adicionar regras.  
C. Security groups novas permitem SSH automaticamente.  
D. Security groups novas so funcionam com Dedicated Hosts.

### Questao 17

Uma instancia precisa acessar um servico AWS por API sem armazenar access key no disco.

Qual direcao arquitetural deve ser adotada?

A. Colocar a access key no user data.  
B. Criar uma chave do usuario root para a instancia.  
C. Tornar o recurso de destino publico.  
D. Anexar uma IAM role por meio de instance profile.

## Bloco 2 - User data e instance types

### Questao 18

Uma equipe quer instalar o Apache automaticamente quando a instancia Amazon Linux for criada.

Qual recurso do EC2 e mais apropriado?

A. Reserved Instance.  
B. Security group outbound.  
C. Elastic IP.  
D. User data com shell script de bootstrap.

### Questao 19

Um script de user data Linux foi adicionado para instalar pacotes, mas a equipe espera que ele rode novamente a cada reboot sem configuracao adicional.

Qual comportamento padrao deve ser considerado?

A. User data Linux sempre roda a cada minuto.  
B. User data Linux nunca roda no lancamento.  
C. User data Linux roda por padrao somente no primeiro boot da instancia.  
D. User data Linux so roda se a porta 22 estiver aberta.

### Questao 20

Um script de user data Linux contem comandos interativos que pedem confirmacao durante a instalacao.

Qual ajuste e mais adequado?

A. Remover o cabecalho `#!`.  
B. Trocar o volume EBS por instance store.  
C. Abrir ICMP para a internet.  
D. Usar comandos nao interativos, como flags `-y`, porque o script nao recebe feedback humano.

### Questao 21

Um user data script em Linux usa AWS CLI para copiar um arquivo de configuracao de um bucket S3 privado. A equipe nao quer colocar access keys no script.

Qual configuracao e necessaria?

A. Adicionar a secret access key no proprio user data.  
B. Tornar o bucket publico temporariamente.  
C. Anexar uma IAM role via instance profile com permissao ao bucket.  
D. Criar uma regra inbound TCP 443 no security group.

### Questao 22

Uma instancia nao ficou configurada como esperado apos o lancamento. O time quer ver a saida do cloud-init em Amazon Linux.

Qual arquivo e um bom ponto de partida?

A. `/etc/hosts`  
B. `/var/log/cloud-init-output.log`  
C. `/home/ec2-user/.ssh/id_rsa`  
D. `/var/lib/mysql/error.csv`

### Questao 23

Uma equipe colocou senha de banco em user data e depois criou uma AMI a partir da instancia.

Qual e o principal risco?

A. User data pode permanecer em diretorios da instancia e expor segredo em instancias derivadas.  
B. User data criptografa automaticamente a senha com uma chave nova.  
C. A AMI remove todos os scripts executados, sem excecao.  
D. Security groups bloqueiam leitura local de user data.

### Questao 24

Uma empresa precisa alterar o user data de uma instancia EC2 ja existente.

Qual condicao normalmente e necessaria para modificar o user data?

A. A instancia deve estar em placement group.  
B. A instancia deve ter IP publico.  
C. A instancia deve estar parada para editar o atributo de user data.  
D. A instancia deve usar Spot Instance.

### Questao 25

Uma aplicacao web pequena tem uso equilibrado de CPU, memoria e rede, sem gargalo especifico.

Qual familia de instancia tende a ser a primeira opcao?

A. High memory bare metal obrigatorio.  
B. Accelerated computing.  
C. Storage optimized.  
D. General purpose.

### Questao 26

Um servico de processamento de video usa intensivamente CPU, mas nao tem grande pressao de memoria.

Qual familia tende a se encaixar melhor?

A. Memory optimized.  
B. Storage gateway.  
C. Compute optimized.  
D. Burstable somente por compliance.

### Questao 27

Um banco em memoria precisa manter grande dataset em RAM com baixa latencia.

Qual categoria de instancia e mais adequada?

A. General purpose pequena.  
B. Storage optimized apenas por ter disco local.  
C. Memory optimized.  
D. Dedicated Host sem avaliar memoria.

### Questao 28

Uma workload de machine learning precisa de GPU para acelerar inferencia.

Qual categoria de instancia deve ser avaliada?

A. Burstable general purpose sempre.  
B. Network optimized sem acelerador.  
C. Instance store sem GPU.  
D. Accelerated computing.

### Questao 29

Uma aplicacao tem I/O local temporario muito intenso e precisa de alta performance de disco local para dados descartaveis.

Qual categoria pode ser apropriada?

A. Storage optimized.  
B. Memory optimized sem disco local.  
C. Tamanho nano com EBS minimo.  
D. Capacity Reservation.

### Questao 30

Uma aplicacao tem CPU normalmente baixa, mas picos ocasionais de curta duracao.

Qual tipo de instancia pode ser considerado para custo-beneficio em workloads compativeis?

A. Instancia burstable.  
B. Dedicated Host obrigatorio.  
C. GPU bare metal.  
D. Zonal Reserved Instance.

### Questao 31

Uma equipe quer escolher uma instancia com base em vCPU, memoria, armazenamento e rede, comparando tamanhos dentro da mesma familia.

Qual conceito do EC2 descreve essas combinacoes?

A. Route table.  
B. Trust policy.  
C. Budget action.  
D. Instance type.

### Questao 32

Uma instancia precisa manter dados de banco com durabilidade e snapshot. O time cogita instance store por ser local.

Qual decisao e mais adequada?

A. Usar instance store como unica copia duravel.  
B. Usar EBS ou outro armazenamento duravel para dados persistentes.  
C. Desabilitar snapshots para reduzir risco.  
D. Armazenar dados no user data.

### Questao 33

Uma organizacao quer restringir quais tipos de instancia podem ser criados em contas de desenvolvimento.

Qual controle central pode ajudar em uma AWS Organization?

A. Service control policy (SCP) com condicoes ou denies para tipos nao aprovados.  
B. Key pair unica compartilhada por todos.  
C. Security group default em cada VPC.  
D. User data padrao com `yum update`.

### Questao 34

Uma aplicacao de teste precisa baixar metadados da propria instancia para descobrir o instance ID.

Qual endpoint IPv4 link-local e usado para instance metadata?

A. `10.0.0.1/latest/meta-data/`  
B. `127.0.0.1/latest/meta-data/`  
C. `169.254.169.254/latest/meta-data/`  
D. `0.0.0.0/latest/meta-data/`

## Bloco 3 - Security groups e acesso SSH

### Questao 35

Uma security group precisa bloquear explicitamente um IP especifico, mantendo outros IPs permitidos.

Qual afirmacao esta correta?

A. Security groups bloqueiam IPs por geolocalizacao automaticamente.  
B. Security groups aceitam deny com prioridade menor que allow.  
C. Security groups usam somente regras deny.  
D. Security groups aceitam regras allow, mas nao regras deny; use outro controle, como NACL ou policy, se precisar de deny explicito.

### Questao 36

Uma instancia tem regra inbound permitindo HTTP na porta 80. Nao ha regra outbound especifica para a resposta, mas a security group ainda possui outbound padrao.

Por que a resposta ao cliente funciona?

A. Security groups sao stateless.  
B. NACLs copiam regras de security group.  
C. Security groups sao stateful e permitem automaticamente o trafego de resposta.  
D. Route 53 cria regras temporarias.

### Questao 37

Um banco em subnet privada deve aceitar conexoes MySQL apenas da camada de aplicacao, que esta em Auto Scaling e troca IPs.

Qual regra e mais adequada no security group do banco?

A. TCP 3306 de `0.0.0.0/0`.  
B. UDP 3306 de qualquer origem.  
C. TCP 22 do IP publico do ALB.  
D. TCP 3306 do security group da camada de aplicacao.

### Questao 38

Um ALB publico encaminha HTTPS para servidores web em EC2. A empresa quer aplicar minimo privilegio nos servidores.

Qual regra inbound deve existir no security group dos servidores web?

A. Porta 443 de `0.0.0.0/0`.  
B. Porta 80/443 somente do security group do ALB, conforme o protocolo usado entre ALB e targets.  
C. Porta 22 de todos os clientes finais.  
D. Todas as portas do CIDR da VPC.

### Questao 39

Uma equipe referencia o security group A como origem em uma regra inbound do security group B. Ela espera que todas as regras de A sejam copiadas para B.

Qual explicacao esta correta?

A. As regras de A sao copiadas para B automaticamente.  
B. A referencia so permite trafego das ENIs associadas ao SG A na direcao e porta definidas; as regras de A nao sao copiadas.  
C. A referencia so funciona com IP publico.  
D. A referencia transforma B em uma NACL.

### Questao 40

Um servidor Linux em subnet publica precisa permitir SSH temporario para um administrador remoto.

Qual configuracao reduz mais o risco?

A. Porta 22 aberta para `0.0.0.0/0` permanentemente.  
B. Porta 22 aberta somente para o IP publico do administrador com `/32` e removida depois.  
C. Porta 3389 aberta para todos.  
D. Sem key pair e com senha padrao.

### Questao 41

Um administrador tenta conectar via SSH em uma instancia Linux, mas recebe erro de permissao sobre a chave privada estar muito aberta.

Qual acao e mais adequada em um cliente Linux/macOS?

A. Tornar a chave privada publicamente legivel.  
B. Ajustar permissoes da chave privada para acesso restrito, como `chmod 400 arquivo.pem`.  
C. Copiar a chave privada para um bucket publico.  
D. Renomear a chave para `.txt`.

### Questao 42

Uma empresa perdeu a chave privada de um key pair usado por uma instancia EC2 Linux.

Qual afirmacao e correta?

A. A AWS pode baixar novamente a chave privada original.  
B. A chave privada original nao pode ser recuperada pela AWS; e necessario usar outro metodo de recuperacao/acesso.  
C. Basta consultar CloudTrail para ver a chave privada.  
D. A chave privada fica em texto claro no security group.

### Questao 43

Uma empresa quer acesso administrativo a EC2 com auditoria e sem abrir portas inbound SSH/RDP.

Qual servico atende melhor ao requisito?

A. AWS Budgets.  
B. EC2 ClassicLink.  
C. Amazon S3 static website.  
D. AWS Systems Manager Session Manager.

### Questao 44

Uma instancia privada precisa ser administrada sem IP publico e usando Session Manager.

Qual combinacao e geralmente necessaria?

A. Instance profile com permissoes SSM e conectividade aos endpoints do Systems Manager.  
B. Porta 22 aberta para internet e key pair compartilhado.  
C. Elastic IP obrigatorio na instancia.  
D. Dedicated Host com RI de 3 anos.

### Questao 45

Uma empresa usa Session Manager e quer registrar atividade de sessoes para auditoria.

Quais destinos podem ser usados para logs de sessao?

A. Somente arquivo local no notebook do administrador.  
B. Security group outbound.  
C. S3 e/ou CloudWatch Logs, com integracao tambem a CloudTrail para chamadas de API.  
D. Elastic IP.

### Questao 46

Uma instancia Linux em subnet privada precisa receber SSH a partir de um bastion host em subnet publica.

Qual regra inbound e mais adequada na instancia privada?

A. TCP 22 de `0.0.0.0/0`.  
B. TCP 22 do security group ou IP privado do bastion, conforme o desenho.  
C. UDP 53 do internet gateway.  
D. TCP 443 do bucket S3.

### Questao 47

Uma security group foi associada a uma instancia. Depois, uma regra inbound foi adicionada ao security group.

Quando a alteracao passa a valer para a instancia?

A. Somente depois de criar uma nova AMI.  
B. Automaticamente para recursos associados ao security group.  
C. Apenas depois de recriar a VPC.  
D. Somente depois de converter para Dedicated Instance.

### Questao 48

Uma equipe associa duas security groups a mesma instancia.

Como as regras sao avaliadas?

A. A security group mais antiga substitui as demais.  
B. Apenas a ultima security group anexada e considerada.  
C. As regras sao agregadas em um unico conjunto de permissoes allow.  
D. As regras viram denies explicitos.

### Questao 49

Um time quer permitir ping para troubleshooting em uma instancia EC2.

Qual tipo de regra deve ser considerada?

A. ICMP Echo Request na security group, limitado a origem necessaria.  
B. TCP 22 aberto para todos.  
C. UDP 3389 de qualquer origem.  
D. Regra IAM `ec2:Ping`.

### Questao 50

Uma empresa quer centralizar uma lista de CIDRs de escritorios para reutilizar em security groups de varias contas.

Qual recurso pode reduzir overhead de atualizacao?

A. AMI publica.  
B. Customer managed prefix list compartilhada com AWS RAM.  
C. Instance store replicado.  
D. User data com uma lista em comentario.

### Questao 51

Uma instancia nao responde na porta 443. A security group permite 443 inbound, mas a NACL da subnet foi alterada para bloquear respostas efemeras.

Qual ponto e importante lembrar?

A. NACLs sao stateless e precisam permitir trafego de ida e volta conforme portas necessarias.  
B. NACLs sempre ignoram trafego HTTPS.  
C. Security groups substituem route tables.  
D. NACLs so existem para RDS.

## Bloco 4 - IAM roles, instance profile e acesso gerenciado

### Questao 52

Uma aplicacao em EC2 precisa ler objetos de um bucket S3 privado sem credenciais de longo prazo.

Qual solucao e mais adequada?

A. Criar usuario IAM com access key no disco da instancia.  
B. Tornar o bucket publico.  
C. Colocar a secret key em user data.  
D. Usar uma IAM role anexada a instancia via instance profile com permissao minima no bucket.

### Questao 53

Ao criar uma role para EC2 pelo console, o time percebe que a instancia usa algo chamado instance profile.

Qual afirmacao esta correta?

A. Instance profile e o container usado para associar uma role IAM a uma instancia EC2.  
B. Instance profile e uma regra de firewall.  
C. Instance profile e um tipo de volume EBS.  
D. Instance profile e uma AMI criptografada.

### Questao 54

Uma role anexada a EC2 permite `s3:GetObject` apenas em um bucket especifico.

Qual principio essa configuracao segue?

A. Acesso publico por padrao.  
B. Menor privilegio.  
C. Deny por security group.  
D. BYOL obrigatorio.

### Questao 55

Uma aplicacao em EC2 usa SDK da AWS. Como ela normalmente recebe credenciais quando ha uma role anexada?

A. Por email enviado pelo IAM.  
B. Por arquivo `.pem` do key pair.  
C. Por credenciais temporarias expostas via instance metadata e renovadas automaticamente.  
D. Por uma senha fixa no security group.

### Questao 56

Um usuario deve poder lancar instancias EC2 com uma role especifica, mas nao com roles administrativas.

Qual permissao precisa ser controlada com cuidado?

A. `iam:PassRole`  
B. `ec2:DescribeAvailabilityZones`  
C. `s3:ListAllMyBuckets`  
D. `cloudwatch:GetMetricData`

### Questao 57

Uma instancia EC2 precisa gravar itens em uma tabela DynamoDB. A equipe quer evitar credenciais no CloudFormation template.

Qual abordagem e mais segura?

A. Inserir access key e secret key como Parameters.  
B. Dar permissao publica a tabela.  
C. Criar role com permissoes DynamoDB e associar via instance profile.  
D. Salvar segredo em tags da instancia.

### Questao 58

Um script em EC2 chama IMDS a cada transacao para buscar credenciais temporarias e comeca a sofrer throttling.

Qual pratica e recomendada?

A. Cachear credenciais ate perto da expiracao e usar retry com backoff quando necessario.  
B. Aumentar chamadas concorrentes ao IMDS.  
C. Desabilitar a role e usar root access key.  
D. Abrir porta 80 inbound.

### Questao 59

Uma empresa quer exigir IMDSv2 em novas instancias para reduzir risco relacionado a metadados.

Qual configuracao esta alinhada a esse objetivo?

A. `httpTokens=optional`.  
B. `httpTokens=required`.  
C. Desabilitar security groups.  
D. Colocar credenciais no user data.

### Questao 60

Uma aplicacao containerizada em EC2 nao consegue acessar IMDSv2 porque o limite de hops esta em 1.

Qual ajuste pode ser necessario, conforme o desenho?

A. Reduzir hop limit para 0.  
B. Aumentar o hop limit para 2 ou passar configuracoes diretamente ao container.  
C. Remover a role IAM da instancia.  
D. Usar somente IP publico elastico.

### Questao 61

Uma equipe quer que uma instancia privada use Session Manager sem trafegar pela internet publica.

Qual desenho pode atender melhor?

A. Usar user data como tunel permanente.  
B. Abrir SSH para `0.0.0.0/0`.  
C. Colocar a instancia em subnet publica com senha local.  
D. Usar VPC endpoints para Systems Manager/SSM Messages/EC2 Messages e instance profile adequado.

### Questao 62

Uma aplicacao em EC2 precisa acessar Secrets Manager para buscar credenciais de banco com rotacao.

Qual permissao deve ser concedida a role da instancia, respeitando menor privilegio?

A. `secretsmanager:GetSecretValue` no segredo necessario, alem de KMS se aplicavel.  
B. `iam:CreateUser` em todos os recursos.  
C. `ec2:TerminateInstances` em `*`.  
D. `s3:PutBucketPublicAccessBlock` em todos os buckets.

### Questao 63

Uma equipe anexou uma role EC2 muito ampla e quer reduzir o blast radius.

Qual acao e mais adequada?

A. Trocar por access keys hardcoded.  
B. Remover todos os logs.  
C. Criar uma policy com apenas as acoes e recursos necessarios.  
D. Abrir todos os ports no security group.

### Questao 64

Uma instancia EC2 assumiu uma role e faz chamadas a S3. O time de auditoria quer identificar qual role foi usada nas chamadas.

Qual servico normalmente registra chamadas de API e identidade do principal?

A. AWS CloudTrail.  
B. Amazon EFS.  
C. AWS Budgets.  
D. EC2 key pair.

### Questao 65

Um time esta em duvida entre IAM role e security group para permitir que EC2 leia S3.

Qual resposta e correta?

A. Security group concede permissao IAM para `s3:GetObject`.  
B. IAM role controla permissoes de API; security group controla trafego de rede.  
C. Key pair concede acesso a S3.  
D. Elastic IP concede acesso a S3.

### Questao 66

Uma instancia EC2 precisa chamar uma API publica externa na porta 443. A security group outbound foi removida e esta vazia.

Qual sera o efeito?

A. Todo outbound continua permitido por padrao mesmo sem regra.  
B. Sem regra outbound, o trafego de saida nao sera permitido pela security group.  
C. Apenas SSH sera permitido.  
D. A NACL cria allow automatico.

### Questao 67

Uma empresa quer evitar que desenvolvedores associem roles privilegiadas a instancias EC2 durante o lancamento.

Qual combinacao e mais adequada?

A. Controlar `iam:PassRole` e restringir quais role ARNs podem ser passadas.  
B. Liberar `iam:PassRole` para `*`.  
C. Remover MFA de todos os usuarios.  
D. Usar somente tags sem policies.

### Questao 68

Uma instancia EC2 precisa acessar S3 em subnet privada sem trafego pela internet.

Qual solucao de rede e mais adequada?

A. IP publico na instancia.  
B. Bastion host para S3.  
C. Gateway VPC endpoint para S3 com rotas/policies adequadas.  
D. Porta 22 aberta para o bucket.

## Bloco 5 - Purchasing options e quiz integrado

### Questao 69

Uma startup executa workload imprevisivel por poucas horas e nao quer compromisso.

Qual opcao de compra EC2 e mais adequada?

A. On-Demand Instances.  
B. Standard Reserved Instances de 3 anos.  
C. Dedicated Host reservado.  
D. Savings Plan de 3 anos para gasto fixo alto.

### Questao 70

Uma aplicacao de producao roda 24/7 com uso estavel em instancias de configuracao conhecida.

Qual opcao normalmente reduz custo em troca de compromisso?

A. Spot Instances como unica capacidade critica.  
B. On-Demand sem compromisso por 3 anos.  
C. Reserved Instances ou Savings Plans, conforme a flexibilidade desejada.  
D. Capacity Reservation sem desconto e sem uso.

### Questao 71

Uma tarefa batch stateless pode ser interrompida e retomada sem perda. O objetivo principal e reduzir custo.

Qual opcao e mais indicada?

A. Dedicated Host.  
B. Zonal Reserved Instance.  
C. Spot Instances.  
D. EC2 Serial Console.

### Questao 72

Uma empresa precisa garantir capacidade de EC2 em tres Availability Zones especificas durante um evento de uma semana.

Qual recurso atende diretamente ao requisito de capacidade?

A. On-Demand Capacity Reservations em cada AZ necessaria.  
B. AWS Budgets com alerta de 80%.  
C. Security group com regra HTTPS.  
D. User data com instalacao de Apache.

### Questao 73

Uma empresa tem licencas de software vinculadas a servidor fisico e precisa visibilidade/controlar host dedicado.

Qual opcao EC2 e mais adequada?

A. Spot Instance.  
B. Dedicated Host.  
C. General purpose t-family.  
D. Gateway VPC endpoint.

### Questao 74

Um workload muda frequentemente de familia e Regiao, mas a empresa consegue se comprometer com um gasto por hora por 1 ano.

Qual modelo costuma oferecer mais flexibilidade de desconto que uma RI de configuracao especifica?

A. Instance store.  
B. Security group.  
C. Savings Plans.  
D. EC2 key pair.

### Questao 75

Uma empresa criou uma Capacity Reservation para 20 instancias em uma AZ, mas executa apenas 15 instancias que correspondem aos atributos.

Como a cobranca deve ser entendida?

A. Cobra somente pelas 15 instancias e nunca pela capacidade sem uso.  
B. Cobra pelas 15 instancias em uso e tambem pela capacidade reservada nao utilizada.  
C. A reserva sem uso e sempre gratuita.  
D. A cobranca vira S3 automaticamente.

### Questao 76

Uma equipe quer desconto, mas tambem precisa garantir capacidade em uma AZ especifica.

Qual diferenca e importante?

A. Savings Plans garantem capacidade automaticamente em qualquer AZ.  
B. Capacity Reservation garante capacidade; Savings Plans/RI regional podem aplicar desconto de billing quando houver atributos compativeis.  
C. Security group garante capacidade.  
D. User data garante desconto.

### Questao 77

Uma empresa executa um baseline 24/7 e picos tolerantes a interrupcao.

Qual combinacao tende a ser custo-efetiva?

A. On-Demand para tudo, sempre.  
B. Reserved Instances/Savings Plans para baseline e Spot para capacidade extra tolerante a interrupcao.  
C. Dedicated Host para todo pico temporario.  
D. Capacity Reservation sem instancias para todo o ambiente.

### Questao 78

Uma organizacao comprou Savings Plans em uma conta e quer que descontos sejam aproveitados por outras contas da organizacao, quando possivel.

Qual configuracao de billing deve ser avaliada?

A. Discount sharing em AWS Organizations/consolidated billing.  
B. Security group referencing.  
C. User data persistente.  
D. IMDSv2 required.

### Questao 79

Uma equipe usa Spot para processamento de fila SQS. As instancias podem ser interrompidas.

Qual pratica torna a arquitetura mais resiliente?

A. Desabilitar health checks.  
B. Armazenar estado apenas em instance store sem checkpoint.  
C. Exigir que Spot nunca interrompa.  
D. Processar mensagens de forma idempotente e permitir retry pela fila.

### Questao 80

Uma empresa quer impedir criacao de recursos quando um budget ultrapassar limite, com menor intervencao manual.

Qual recurso pode executar uma resposta automatizada aprovada?

A. Budget action aplicando uma policy/IAM action configurada.  
B. Key pair SSH.  
C. Elastic IP.  
D. EC2 screenshot.

### Questao 81

Uma instancia web publica deve servir HTTPS para usuarios globais, enquanto o banco deve aceitar conexao apenas da camada web.

Qual estrategia de SG segue menor privilegio?

A. Web SG permite 443 da internet; DB SG permite porta do banco a partir do Web SG.  
B. DB SG permite 3306 de `0.0.0.0/0`.  
C. Web SG permite todas as portas de qualquer origem.  
D. Ambos usam o default SG sem revisao.

### Questao 82

Uma instancia em subnet privada precisa acessar S3 e DynamoDB sem expor credenciais e sem trafego pela internet.

Qual combinacao e mais adequada?

A. IAM role/instance profile e VPC endpoints adequados para os servicos.  
B. Access key no disco e IP publico.  
C. SSH aberto e bucket publico.  
D. Dedicated Host e senha local.

### Questao 83

Um laboratorio de EC2 cria um budget, lanca instancia, usa user data e testa um web server. A pagina nao abre no navegador, mas o processo HTTP esta rodando.

Qual causa de rede deve ser verificada primeiro?

A. Se a role IAM tem `iam:PassRole`.  
B. Se a security group permite HTTP/HTTPS inbound da origem esperada.  
C. Se o Savings Plan esta ativo.  
D. Se o user data esta em base64 no Cost Explorer.

### Questao 84

Uma instancia usa user data para instalar pacote e criar arquivo local. Depois de editar o user data e iniciar a instancia novamente, a mudanca nao executou em Linux.

Qual explicacao e mais provavel?

A. User data Linux editado fica visivel, mas scripts nao rodam automaticamente em start/reboot sem configuracao adicional.  
B. Security groups bloqueiam user data.  
C. Budgets impedem scripts.  
D. Spot Instances nunca executam user data.

### Questao 85

Um arquiteto quer resumir a decisao correta para EC2 basico em prova: acesso AWS API, rede, bootstrap e custo.

Qual combinacao esta correta?

A. Access key no disco, SG aberto para todos, instalacao manual e On-Demand sempre.  
B. Role via instance profile para APIs, SGs com menor privilegio, user data para bootstrap e opcao de compra conforme padrao de uso.  
C. Root user na instancia, NACL aberta, sem logs e Dedicated Host para todos os casos.  
D. Bucket publico para credenciais, SSH aberto e Spot para workloads criticos sem tolerancia.

## Gabarito comentado

1. D - AWS Budgets permite criar budgets de custo/uso e enviar notificacoes por email ou SNS quando limites reais ou previstos sao atingidos.
2. D - Cost Explorer e a ferramenta de analise de custo e uso com filtros por dimensoes como servico, conta, tags e tipos/familias.
3. C - AWS Budgets tem budgets de utilizacao e cobertura para RIs e Savings Plans.
4. D - Amazon EC2 fornece instancias, que sao servidores virtuais configuraveis na AWS.
5. D - AMIs sao templates pre-configurados com sistema operacional e softwares base para lancar instancias.
6. D - EBS e armazenamento persistente para instancias EC2 e suporta snapshots.
7. C - Instance store e armazenamento local temporario e nao deve ser a unica copia de dados duraveis.
8. D - Elastic IP mantem um endereco IPv4 publico estatico associado a conta enquanto usado corretamente.
9. A - Tags consistentes ajudam a agrupar, alocar custo e governar recursos.
10. C - NAT gateway permite saida de instancias privadas para a internet sem conexoes inbound diretas.
11. C - ALB com Auto Scaling em multiplas AZs melhora disponibilidade e distribuicao de trafego.
12. D - Para um unico IP, use CIDR /32 e limite a porta/protocolo necessario.
13. C - On-Demand e indicado para uso curto, imprevisivel e sem compromisso.
14. D - EFS oferece sistema de arquivos compartilhado e gerenciado para multiplas instancias.
15. A - AMI customizada padroniza lancamentos com SO, pacotes e agentes pre-instalados.
16. B - Security groups novas nao permitem inbound ate que regras sejam adicionadas.
17. D - Roles para EC2 entregam credenciais temporarias por instance profile, evitando access keys longas.
18. D - User data e usado para bootstrap no lancamento da instancia.
19. C - Em Linux, user data e cloud-init rodam por padrao apenas no primeiro boot.
20. D - Scripts de user data nao sao interativos; flags como `-y` evitam prompts.
21. C - Chamadas AWS API em user data devem usar instance profile com permissoes adequadas, nao chaves hardcoded.
22. B - `/var/log/cloud-init-output.log` e o log comum para depurar user data em Amazon Linux.
23. A - User data pode permanecer no sistema de arquivos da instancia; segredos ali podem vazar para AMIs derivadas.
24. C - Para editar user data de uma instancia existente, normalmente e preciso parar a instancia.
25. D - General purpose atende workloads equilibrados.
26. C - Compute optimized e indicado para workloads com alta demanda de CPU.
27. C - Memory optimized atende workloads que precisam de muita memoria.
28. D - Accelerated computing inclui GPU e aceleradores especializados.
29. A - Storage optimized atende workloads com alto I/O local, desde que os dados sejam temporarios ou replicados.
30. A - Instancias burstable podem atender workloads com baseline baixo e picos curtos.
31. D - Instance type define combinacoes de CPU, memoria, armazenamento e rede.
32. B - Dados persistentes devem usar armazenamento duravel como EBS, e nao instance store como unica copia.
33. A - SCPs podem restringir acoes e parametros em contas de uma Organization.
34. C - `169.254.169.254` e o endpoint IPv4 link-local do IMDS.
35. D - Security groups permitem apenas regras allow; denies exigem outro mecanismo.
36. C - Security groups sao stateful e rastreiam conexoes para permitir respostas.
37. D - Referenciar o SG da aplicacao evita depender de IPs dinamicos.
38. B - Os servidores devem aceitar somente trafego vindo do SG do ALB na porta necessaria.
39. B - Referencia de SG define origem/destino permitido, sem copiar regras.
40. B - Limitar SSH a `/32` temporario reduz exposicao.
41. B - Clientes SSH exigem chave privada com permissoes restritas.
42. B - A AWS nao disponibiliza novamente a chave privada; e preciso outro caminho de recuperacao.
43. D - Session Manager permite acesso gerenciado, auditavel e sem portas inbound abertas.
44. A - Session Manager requer permissao SSM na instancia e conectividade aos endpoints/servico.
45. C - Session Manager pode enviar logs para S3/CloudWatch Logs e CloudTrail registra chamadas de API.
46. B - A instancia privada deve aceitar SSH somente do bastion, preferencialmente via SG.
47. B - Alteracoes em regras de SG aplicam automaticamente aos recursos associados.
48. C - Multiplas SGs anexadas sao agregadas como conjunto de regras allow.
49. A - Ping usa ICMP; limite a origem ao necessario.
50. B - Prefix lists compartilhadas centralizam CIDRs e podem ser referenciadas por SGs.
51. A - NACLs sao stateless e precisam permitir ida e volta, incluindo portas efemeras quando aplicavel.
52. D - Role via instance profile entrega credenciais temporarias e segue menor privilegio.
53. A - Instance profile e o mecanismo usado para associar role IAM a EC2.
54. B - Permitir apenas acoes e recursos necessarios aplica menor privilegio.
55. C - Apps em EC2 obtem credenciais temporarias pela metadata service quando ha role anexada.
56. A - `iam:PassRole` controla quais roles um principal pode passar para servicos como EC2.
57. C - Instance profile evita expor credenciais em templates e arquivos.
58. A - Credenciais do IMDS devem ser cacheadas ate perto da expiracao; em throttling use backoff.
59. B - `httpTokens=required` exige IMDSv2.
60. B - Containers podem precisar de hop limit 2 ou configuracao injetada sem IMDS.
61. D - VPC endpoints para SSM/SSM Messages/EC2 Messages permitem acesso privado ao Session Manager.
62. A - A role deve ter permissoes minimas no segredo e KMS quando a chave exigir.
63. C - Policies especificas reduzem blast radius.
64. A - CloudTrail registra chamadas de API e identidade do principal.
65. B - IAM controla permissoes de API; SG controla rede.
66. B - Sem regras outbound, a SG nao permite trafego de saida.
67. A - Restrinja `iam:PassRole` aos ARNs aprovados para evitar privilege escalation.
68. C - Gateway endpoint para S3 permite acesso privado sem internet.
69. A - On-Demand atende uso imprevisivel sem compromisso.
70. C - RI/Savings Plans reduzem custo para uso previsivel mediante compromisso.
71. C - Spot e indicado para workloads tolerantes a interrupcao.
72. A - Capacity Reservations garantem capacidade em AZ especifica.
73. B - Dedicated Host fornece servidor fisico dedicado e suporte a cenarios BYOL/compliance.
74. C - Savings Plans da desconto baseado em compromisso de gasto, com flexibilidade conforme o tipo do plano.
75. B - Capacity Reservation cobra pela capacidade usada e pela parte reservada sem uso.
76. B - Capacity Reservation e sobre capacidade; Savings Plans/RI regional sao desconto de billing quando compativeis.
77. B - Baseline previsivel combina com compromisso; picos tolerantes podem usar Spot.
78. A - Discount sharing em Organizations/consolidated billing permite compartilhar beneficios conforme configuracao.
79. D - Idempotencia e retry por fila ajudam a tolerar interrupcoes Spot.
80. A - Budget actions podem aplicar acoes como policies quando thresholds definidos sao atingidos.
81. A - SG por camada com referencia entre SGs aplica menor privilegio.
82. A - Role resolve autorizacao; VPC endpoints resolvem caminho privado de rede.
83. B - Mesmo com servico rodando, SG precisa permitir a porta HTTP/HTTPS da origem correta.
84. A - Editar user data nao faz Linux executar novamente automaticamente em start/reboot sem configuracao adicional.
85. B - Essa combinacao resume boas praticas: role para API, SG minimo, user data para bootstrap e compra conforme padrao de uso.

## Referencias oficiais consultadas via AWS Docs MCP

- What is Amazon EC2?: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html
- Amazon EC2 instance types: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html
- Run commands when you launch an EC2 instance with user data input: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
- Security group rules: https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html
- Use an IAM role to grant permissions to applications running on Amazon EC2 instances: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html
- Access instance metadata for an EC2 instance: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html
- AWS Systems Manager Session Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
- Managing your costs with AWS Budgets: https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- Capacity Reservation pricing and billing: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/capacity-reservations-pricing-billing.html

## Materiais locais usados como referencia

- `/home/lucksanjos/Downloads/AWS Certified Solutions Architect Associate SAA-C03.pdf`
- `/home/lucksanjos/Downloads/AWS SAA-03 Solution.txt`
- `aws-study/aws-iam-security-basic-timed-exam-60.md`
- `2026-05-01-add-aws-iam-security-practice-exam/journal.md`
