# Do app gratuito à assinatura: Google Play, RevenueCat, Supabase e Expo EAS

Publicado em 8 de novembro de 2026 · Por Renan Rodolfo Dev

::: info Sobre os exemplos
Este guia nasceu de uma integração realizada em um aplicativo Expo.
Os exemplos foram generalizados para reutilização: `SeuApp`, IDs de serviços,
URLs e caminhos privados são fictícios. Não execute comandos sem substituir
esses valores e conferir o ambiente de destino.
:::

Este artigo documenta o caminho seguido para configurar assinaturas Android em
um aplicativo Expo. Ele reúne o cadastro comercial, os produtos, as credenciais, as
notificações, o backend e a distribuição. Inclui verificações e um roteiro de testes para validar cada conexão.

Os nomes dos menus podem variar conforme o idioma e as atualizações dos painéis.
Quando isso acontecer, procure o nome em inglês indicado entre parênteses.

## 1. Entenda quem faz o quê

O usuário instala o aplicativo gratuitamente. Quando decide assinar, a compra é
feita na Google Play. O RevenueCat verifica essa compra e organiza o estado da
assinatura. O Supabase confirma o direito de acesso usado pelo SeuApp.

O Expo EAS compila o aplicativo e inclui a chave pública necessária ao SDK.
Ele não processa pagamentos.

```text
App Android ── checkout ──> Google Play Billing
App Android ── SDK ──────> RevenueCat
Google Play ── RTDN ──> Google Cloud Pub/Sub ──> RevenueCat
RevenueCat ── webhook autenticado ──> Supabase
App ── billing-sync com JWT ───────> Supabase
Supabase ── consulta API RevenueCat ──> confirma acesso pago
```

São dois caminhos complementares: o webhook acompanha mudanças mesmo sem o app
aberto; `billing-sync` tenta confirmar o acesso imediatamente após uma compra ou
restauração. Isso reduz a dependência da chegada do webhook naquele instante.

Os dados de uso do aplicativo e o estado da assinatura têm responsabilidades
diferentes. Envie aos serviços de pagamento apenas os dados necessários para
identificar o cliente e verificar seu direito de acesso.

## 2. Identificadores que precisam combinar

Os valores abaixo são exemplos. Troque-os pelos IDs reais do seu projeto.

| Item | Exemplo | Onde aparece |
|---|---|---|
| Pacote Android | `com.seuapp.app` | Expo, Google Play e RevenueCat |
| Assinatura | `seuapp_pro` | Play Console |
| Plano básico | `monthly` | Play Console |
| Produto RevenueCat | `seuapp_pro:monthly` | Product catalog |
| Entitlement | `pro` | Direito de acesso |
| Offering | `default` | Oferta atual |
| Package | `$rc_monthly` | Pacote mensal |
| App RevenueCat | `appSEU_APP_ID` | Settings do app e filtro do webhook |
| Projeto Supabase | `SEU_PROJECT_REF` | Dashboard do Supabase |

Um entitlement representa o acesso comprado; uma offering reúne opções de compra;
um package representa uma opção como o plano mensal. Associe o mesmo produto
ao entitlement e ao package.

## 3. Prepare a Play Console

### 3.1 O download continua gratuito

Não é necessário transformar o aplicativo em pago para vender assinaturas.
O preço de instalação é independente da compra dentro do app. No SeuApp,
o download permanece gratuito e o Pro é contratado dentro dele.

[Referência: preços do app e preços dos produtos](https://support.google.com/googleplay/android-developer/answer/6334373?hl=pt-BR).

### 3.2 Perfil para pagamentos

Caminho: **Play Console → Página inicial → Gerenciar conta → Configurações de
apps do Google Play → Configurações de monetização → Perfil para pagamentos**.

1. Crie ou selecione o perfil para pagamentos.
2. Preencha a identidade legal e o endereço correspondente ao cadastro.
3. Informe os dados de contato e suporte solicitados.
4. Conclua as verificações e a configuração de recebimento apresentadas pelo Google.

Contas pessoais também podem gerar receita. Não é obrigatório escolher uma
organização apenas porque o app terá assinatura. Use o tipo de perfil adequado
à sua situação e não invente dados de empresa.

[Tipos de conta de desenvolvedor](https://support.google.com/googleplay/android-developer/answer/13634885?hl=pt-BR)
e [perfil para pagamentos](https://support.google.com/googleplay/android-developer/answer/7161426?hl=pt-BR).

### 3.3 Envie uma build com suporte a compras

Durante a configuração, a tela de assinaturas mostrava apenas **“Faça upload de
um novo APK”**. Depois de enviar a versão contendo o SDK de compras, a opção de
criar assinatura apareceu.

O projeto usa `react-native-purchases`. O SDK contém código nativo: Expo Go não
basta para validar esse fluxo. AAB é aceito na faixa de teste; o texto “APK”
do botão não obriga trocar o formato do build.

Não conclua que precisa publicar em produção só porque não aparece o botão.
Verifique primeiro o pacote enviado, o suporte a Billing e as pendências da conta.

## 4. Crie a assinatura e o plano básico

Caminho: **Play Console → SeuApp → Monetizar com o Google Play → Produtos →
Assinaturas → Criar assinatura**.

| Campo | Preenchimento |
|---|---|
| ID do produto | `seuapp_pro` |
| Nome | SeuApp Pro |
| Descrição | Texto curto, respeitando o limite informado pela tela |

Exemplo de descrição com menos de 200 caracteres:

> Acesse os recursos premium do aplicativo. Assinatura mensal com renovação automática até o cancelamento.

Se aparecer **“Não foi possível salvar as alterações”**, confira os limites de
caracteres indicados no formulário, inclusive os da descrição.

Descreva os benefícios reais da assinatura, como acesso a ferramentas avançadas
ou limites maiores de uso, quando isso se aplicar. Respeite o limite de cada benefício.

Para o ícone, use um PNG RGBA de 32 bits, quadrado, entre 512 e 1080 pixels por
lado, até 8 MB, conforme a exigência mostrada no formulário. Um PNG de
512 × 512 pixels com RGBA atende a essas dimensões.

Em tributos e compliance, confira se categorias como **Vendas de apps digitais**
e **Serviço** representam o produto oferecido. A seleção deve refletir sua oferta; país
de venda, classificação etária e dados fiscais são decisões distintas.

Depois abra a assinatura e siga **Adicionar plano básico**:

1. ID: `monthly`.
2. Tipo: **Renovação automática**.
3. Período de faturamento: **Mensal**.
4. Em **Preço e disponibilidade → Gerenciar disponibilidade por país/região**,
   selecione os locais em que pretende vender.
5. Defina os preços e confira o valor final mostrado ao comprador.
6. Salve e clique em **Ativar**.

Você pode começar por um único país, mas isso não é uma obrigação técnica. O país da conta Play do testador precisa ser compatível com a oferta.
Defina o preço de acordo com o produto e confira o valor final na loja.

Se oferecer um período gratuito, escolha como ele será concedido: por uma oferta
da Google Play ou por uma regra própria do aplicativo. São mecanismos diferentes.
Evite configurar os dois sem definir como os prazos e a cobrança se relacionam.

[Referência: criar assinaturas e planos](https://support.google.com/googleplay/android-developer/answer/140504?hl=pt-BR).

## 5. Configure o catálogo no RevenueCat

Caminho inicial: **RevenueCat → projeto SeuApp → Apps → adicionar app Google Play**.
Use o pacote `com.seuapp.app`.

Em **Product catalog**, configure:

1. **Products**: cadastre/importe `seuapp_pro:monthly` no app Android.
2. **Entitlements**: crie `pro` e associe o produto.
3. **Offerings**: crie `default` e marque como atual.
4. Dentro da offering, adicione o package mensal `$rc_monthly`.
5. Associe esse package ao mesmo produto Google Play.

Esses recursos podem ser criados pelo painel ou pelo MCP. Registrar o produto no RevenueCat não
substitui sua criação e ativação na Play Console.

### Identidade e restauração

O código identifica o cliente no SDK pelo UUID da conta Supabase. A compra deve
ser feita depois dessa identificação, inclusive após troca de conta.

Caminho: **RevenueCat → SeuApp → Project settings → General → Restore behavior**.
Para a regra escolhida, configure **Keep with original App User ID**.

Confira explicitamente essa configuração no painel. O padrão do RevenueCat
pode transferir compras entre usuários identificados; não presuma que o padrão
já é a regra desejada. Restaurar na conta original deve funcionar; outra conta
deve receber orientação para recuperar o login original.

[Referência: restore behavior](https://www.revenuecat.com/docs/projects/restore-behavior).

## 6. Conecte Google Cloud e Google Play

### 6.1 Projeto e APIs

No [Google Cloud Console](https://console.cloud.google.com/), selecione o projeto
no topo. Ele pode pertencer a outra conta Google, desde que você tenha acesso
administrativo suficiente. Neste guia, o identificador de exemplo é `SEU_PROJETO_CLOUD`.

Caminho: **menu ☰ → APIs e serviços → Biblioteca**. Ative:

- Google Play Android Developer API.
- Google Play Developer Reporting API.
- Cloud Pub/Sub API.

Em **APIs e serviços → APIs e serviços ativados**, confira a presença das APIs.
Na página individual, **Gerenciar/Desativar** indica que a API já está ativa;
**Ativar** indica que falta habilitá-la.

### 6.2 Conta de serviço e JSON

Caminho: **menu ☰ → IAM e administrador → Contas de serviço → Criar conta de serviço**.
Crie uma identidade exclusiva, por exemplo **RevenueCat SeuApp**.

Em **IAM e administrador → IAM → Permitir acesso**, informe o e-mail dessa conta
e atribua **Editor do Pub/Sub** e **Visualizador do Monitoring**.

O endereço aparece na coluna **E-mail** em **Contas de serviço** e termina em
`.iam.gserviceaccount.com`. Não é seu Gmail nem o login do RevenueCat.

Depois siga **Contas de serviço → RevenueCat SeuApp → Chaves → Adicionar chave
→ Criar nova chave → JSON**. Guarde o download fora do repositório.

Uma conta usada para deploy/EAS pode continuar separada. Não é necessário
substituir sua chave para configurar a integração de pagamentos.

### 6.3 Permissões na Play Console

Caminho: **Play Console → Página inicial → Gerenciar conta → Usuários e permissões
→ Convidar novos usuários**.

Convide o e-mail da conta de serviço. Em **Permissões do app**, inclua SeuApp.
Em **Permissões da conta**, configure os acessos indicados pelo guia do RevenueCat:

- Ver informações do app e baixar relatórios em massa.
- Ver dados financeiros, pedidos e respostas da pesquisa de cancelamento.
- Gerenciar pedidos e assinaturas.
- Gerenciar presença na loja.

Salve/conclua o convite e confira o estado ativo do usuário de serviço.

### 6.4 Envie a credencial ao RevenueCat

Caminho: **RevenueCat → SeuApp → Apps → SeuApp Android → Service account
credentials → Service Account Credentials JSON**.

Envie o JSON e clique em **Save changes**. Abra o status e execute **Check credentials**.
O resultado esperado é **Valid credentials**.

Se as permissões foram alteradas, o JSON não precisa ser recriado. Confira se o
**Client Email** corresponde ao usuário autorizado na Play. A propagação pode
levar até 36 horas.

[Guia de credenciais do RevenueCat](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)
e [acesso à API Google Play](https://developers.google.com/android-publisher/getting_started).

## 7. Configure as notificações Google Play → RevenueCat

RTDN significa notificações do desenvolvedor em tempo real. Elas passam pelo
Google Cloud Pub/Sub e avisam o RevenueCat sobre mudanças de compras.

### 7.1 Conectar o tópico

Caminho: **RevenueCat → SeuApp → Apps → SeuApp Android → Google developer notifications**.

Escolha o tópico, por exemplo `Play-Store-Notifications`, e clique em **Connect to Google**.
Copie o nome completo gerado, no formato:

```text
projects/SEU_PROJETO_CLOUD/topics/Play-Store-Notifications
```

Copie pelo botão do painel; o texto pode estar cortado visualmente.

Se aparecer erro de permissão para adicionar a Play como publicadora:

1. **Google Cloud → menu ☰ → Ver todos os produtos → Pub/Sub → Tópicos**.
   Também é possível pesquisar `Pub/Sub` na barra superior.
2. Abra o tópico exato usado pelo RevenueCat.
3. **Permissões → Adicionar principal**.
4. Principal: `google-play-developer-notifications@system.gserviceaccount.com`.
5. Papel: **Publicador do Pub/Sub**.
6. Salve e tente a conexão novamente no RevenueCat.

### 7.2 Informar o tópico à Play e testar

Caminho: **Play Console → SeuApp → Monetizar com o Google Play → Configuração
de monetização → Notificações do desenvolvedor em tempo real**.

1. Cole o nome completo em **Nome do tópico**.
2. Selecione assinaturas, compras anuladas e todos os produtos únicos.
3. Salve as alterações.
4. Clique em **Enviar notificação de teste**.
5. Volte à seção de notificações no RevenueCat e atualize a página.

O resultado esperado é **Last received** com horário recente. Esse horário comprova a chegada do teste enviado pela Play.

Deixe **Track new purchases from server-to-server notifications** desmarcado
para este fluxo identificado pelo SDK. Essa opção trata compras ainda não
conhecidas pelo RevenueCat e não é necessária para receber as notificações normais.

[Referência: Google RTDN](https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications).

## 8. Não misture as credenciais

| Credencial | Finalidade | Destino |
|---|---|---|
| JSON da conta de serviço Google | RevenueCat acessa APIs da Play | Campo de credenciais do app no RevenueCat |
| Chave pública Android `goog_...` | SDK do aplicativo | Ambiente EAS e binário Android |
| Chave secreta API v1 | Backend consulta clientes RevenueCat | Secrets das Edge Functions do Supabase |
| Segredo próprio do webhook | Autenticar RevenueCat → Supabase | Supabase e Authorization header do webhook |
| Token OAuth do MCP/CLI | Operações administrativas | Ferramenta administrativa, fora do app |

A chave pública não substitui a secreta. O JSON Google não substitui nenhuma das
chaves API do RevenueCat. O segredo do webhook é um valor aleatório próprio,
não uma chave `goog_` ou a chave API v1.

## 9. Variáveis do Expo EAS

Caminho: **expo.dev → sua conta → seu projeto
→ Environment variables → Create variable**.

| Nome | Valor | Ambiente |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY` | Chave SDK Android `goog_...` | `production` |
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto de produção | `production` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave pública compatível com o cliente atual | `production` |

Para copiar a chave SDK: **RevenueCat → SeuApp → API keys → SDK API keys →
SeuApp Android**. Na variável EAS, use tipo String e visibilidade Plain text.
Tudo que o aplicativo consome como `EXPO_PUBLIC_*` pode ser recuperado do binário;
não coloque chaves de servidor nessas variáveis.

Configure o perfil `production` do `eas.json` para gerar AAB e gerenciar o
versionCode, por exemplo com incremento automático.
Adicionar a variável não muda um AAB já compilado. É necessária nova build para
esta entrega; Expo Go não valida compras nativas.

[Referência: variáveis EAS](https://docs.expo.dev/eas/environment-variables/).

## 10. Secrets e publicação no Supabase

### 10.1 Confira a conta e o projeto

Selecione o projeto correto, representado aqui por `SEU_PROJECT_REF`.
Se o projeto não aparecer, confira a conta e a organização usadas pelo MCP ou pela CLI.

Para autenticar a CLI sem abrir o navegador automaticamente:

```powershell
npx --yes supabase login --no-browser --agent no --output-format text
npx --yes supabase projects list --output json
```

Abra o link gerado, autentique na conta correta e conclua a verificação pedida
pela CLI. Os parâmetros `--agent no --output-format text` foram necessários na
versão utilizada para evitar a tentativa de prompt em modo JSON.

Login na CLI e conexão do plugin MCP são autenticações separadas.

### 10.2 Cadastre as variáveis do servidor

Crie a chave em **RevenueCat → SeuApp → API keys → Secret API keys → criar
chave API v1**. O código consulta o endpoint `/v1/subscribers`; a chave de um MCP
não deve ser reutilizada automaticamente como se fosse essa credencial.

Caminho de destino: **Supabase Dashboard → SeuApp → Edge Functions → Secrets**.

| Secret | Valor |
|---|---|
| `REVENUECAT_SECRET_API_KEY` | Chave secreta API v1 do projeto correto |
| `REVENUECAT_WEBHOOK_SECRET` | Segredo aleatório longo |
| `REVENUECAT_APP_ID` | `appSEU_APP_ID` |
| `REVENUECAT_ENTITLEMENT_ID` | `pro` |
| `REVENUECAT_PRODUCT_ID` | `seuapp_pro:monthly` |
| `REVENUECAT_ALLOW_SANDBOX` | `false` em produção |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidas pelo ambiente hospedado.
Não copie a service-role para o EAS. Documente apenas os nomes das variáveis
em um arquivo `.env.example`, sem valores privados.

Alternativa pela CLI, com um arquivo privado fora do Git:

```powershell
npx --yes supabase secrets set --remote=SEU_PROJECT_REF --env-file 'C:\caminho-privado\billing.env' --yes
```

### 10.3 Migrations e funções

::: warning Código específico do seu aplicativo
Este repositório publica o artigo e não inclui um backend pronto. Os comandos de
deploy pressupõem que você já implementou `billing-sync`, `revenuecat-webhook`,
as RPCs e as tabelas descritas abaixo no seu aplicativo. Os scripts `npm test`,
`npm run ts` e `npm run test:db` são exemplos: configure os equivalentes no seu projeto.
Adapte o schema, implemente as validações e seus testes antes de publicar.
Os nomes de tabelas e RPCs são sugestões de arquitetura, não recursos nativos do Supabase.
:::

Antes de publicar, rode os testes e confira o histórico remoto. Os comandos
abaixo refletem a CLI usada nesta configuração; consulte `--help` se atualizar.

```powershell
npm test -- --runInBand
npm run ts
npm run test:db
npx --yes supabase migration list --remote=SEU_PROJECT_REF
npx --yes supabase db push --remote=SEU_PROJECT_REF --dry-run --skip-vault
```

Confira se o dry-run lista apenas as migrations esperadas para seu schema de
assinaturas. Os arquivos e os nomes dependem da sua implementação.

Só depois de conferir as migrations pendentes:

```powershell
npx --yes supabase db push --remote=SEU_PROJECT_REF --skip-vault --yes
npx --yes supabase functions deploy billing-sync revenuecat-webhook --remote=SEU_PROJECT_REF --no-verify-jwt --use-api --yes
```

Não use `db reset` no projeto remoto. Confira quais migrations já foram aplicadas;
não remova seu histórico nem reaplique manualmente seu conteúdo.

A verificação JWT automática está desligada nessas funções por razões distintas:
`billing-sync` valida o token com `auth.getUser` no próprio handler;
`revenuecat-webhook` valida seu segredo no cabeçalho Authorization.
Desligar a verificação automática sem essas validações deixaria um endpoint aberto.

### 10.4 Responsabilidades sugeridas para o backend

- Uma tabela como `billing_accounts` mantém expiração e confirmação paga por conta.
- RLS restringe a leitura à conta dona dos dados.
- Usuários anônimos e autenticados não podem executar `apply_billing_snapshot`.
- Apenas o backend com service-role grava snapshots de pagamento.
- O webhook consulta o estado atual na API RevenueCat; não concede acesso
  apenas porque o payload diz que houve compra.
- Cancelar renovação não encerra o período já pago; expiração/reembolso são
  reconciliados a partir do estado atual.

[Referência: secrets das funções](https://supabase.com/docs/guides/functions/secrets).

## 11. Configure o webhook RevenueCat → Supabase

Este webhook é outra conexão. Ele não é o tópico Pub/Sub configurado na Play.

Caminho: **RevenueCat → SeuApp → Integrations → Webhooks → Add webhook**.

| Campo | Valor de produção |
|---|---|
| Nome | SeuApp Supabase - Producao |
| URL | `https://SEU_PROJECT_REF.supabase.co/functions/v1/revenuecat-webhook` |
| App | SeuApp Android |
| Environment | Production |
| Eventos | Eventos de assinatura relevantes; na configuração criada, todos os tipos do app |
| Authorization header | `Bearer <mesmo valor de REVENUECAT_WEBHOOK_SECRET>` |

O prefixo `Bearer` e o espaço fazem parte do cabeçalho. Salve as alterações.
O valor real não deve aparecer em screenshots, documentação ou commits.

Na ferramenta MCP utilizada, a integração pôde ser criada, mas o campo Authorization
precisou ser preenchido no painel. Confira as capacidades da sua ferramenta.

### Teste independente de build

Na configuração do webhook, clique em **Send test event**. O resultado esperado
é HTTP `200`, com resposta semelhante a:

```json
{"ok":true,"test":true}
```

Um payload com `type: TEST`,
`product_id: test_product` e `environment: SANDBOX` é sintético. O handler
reconhece TEST antes de processar compras e não libera o Pro por causa dele.

HTTP 200 nesse teste prova entrega e autenticação. Não prova que a chave API v1
consulta uma compra real, nem que o direito foi gravado e atualizado no app.

## 12. Gere a build e disponibilize na faixa correta

```powershell
eas build --platform android --profile production --non-interactive --no-wait
```

Se o cálculo de fingerprint local ficar excessivamente demorado, o EAS mostrou
a alternativa opcional `EAS_SKIP_AUTO_FINGERPRINT=1`. Isso não deve ser confundido
com uma correção para falha de compilação Android.

Depois de configurar a chave pública, gere uma build e confira seu status no EAS.

O perfil de build se chama `production`, mas isso não publica automaticamente o
app na faixa pública da Play. Ele gera um binário para loja.

### Envio manual para teste fechado

1. Baixe o AAB de uma build concluída no EAS.
2. **Play Console → SeuApp → Testar e lançar → Teste → Teste fechado**.
3. Abra **Gerenciar faixa** na faixa usada pelos testadores.
4. Clique em **Criar nova versão**, ou abra o rascunho existente.
5. Envie o AAB; se ele já estiver na biblioteca, selecione-o de lá.
6. Preencha as notas, salve, revise e conclua o lançamento.
7. Em **Visão geral da publicação**, envie as mudanças para revisão, se solicitado.
8. Se houver publicação gerenciada, publique as alterações depois da aprovação.
9. No aparelho, atualize pela Play Store usando a conta participante do teste.

Confira `submit.production.android.track` no `eas.json` antes de enviar. Se o
valor for `internal`, `eas submit --profile production` envia para teste
**interno**. Ajuste o perfil para a faixa desejada ou faça o envio manual descrito acima.

Ter vários AABs enviados não torna o mais novo ativo. Rascunho, revisão e
publicação pendentes mantêm a versão anterior disponível aos testadores.

[Referência: preparar e lançar versões](https://support.google.com/googleplay/android-developer/answer/9859348?hl=pt-BR).

## 13. Testadores da faixa e testadores de licença são diferentes

### Acesso ao aplicativo de teste

Caminho: **Play Console → SeuApp → Testar e lançar → Teste → Teste fechado
→ Gerenciar faixa → Testadores**.

Cadastre os e-mails ou grupos. Em **Como os testadores podem participar →
Participar na Web → Copiar link**, copie o convite. O usuário precisa aceitar
o teste com a mesma conta Google usada na Play Store.

Se a faixa usa Google Groups, entrar no grupo e aceitar o convite são duas
ações distintas. Compartilhar apenas a página da loja pode não bastar.

### Compras sem cobrança real

Caminho: **Play Console → Página inicial → Gerenciar conta → Configurações de apps
do Google Play → Configurações de monetização → Teste de licença**.

1. Escolha **Listas de e-mails → Criar lista**.
2. Adicione o Gmail usado no aparelho.
3. Salve a lista.
4. Marque essa lista como selecionada e salve as alterações da página.

Use uma lista pequena de pessoas responsáveis por validar compras. Um grupo
amplo de teste fechado não precisa se tornar testador de licença inteiro.

No checkout, confirme a presença de um instrumento como **Cartão de teste,
sempre aprova** e a indicação de compra de teste. Participar somente da faixa
fechada não garante que a compra seja gratuita.

[Referência: teste de licença](https://support.google.com/googleplay/android-developer/answer/6062777?hl=pt-BR).

## 14. Prepare a homologação antes da compra ponta a ponta

**Prepare este ambiente antes de testar a liberação de acesso.** O backend de produção usa
`REVENUECAT_ALLOW_SANDBOX=false`, e o webhook filtra eventos de produção.
Uma compra de licença pode ser concluída no checkout e aparecer no RevenueCat,
mas não concederá acesso pago nesse backend.

Não resolva isso mudando globalmente a produção para aceitar sandbox.
O plano de homologação precisa incluir:

1. Projeto Supabase separado, com schema, Auth e funções equivalentes.
2. Secrets exclusivos desse ambiente; nele, `REVENUECAT_ALLOW_SANDBOX=true`.
3. Webhook RevenueCat separado, filtrado para **Sandbox**, apontando para esse
   Supabase, com seu próprio segredo de Authorization.
4. Ambiente/perfil EAS de homologação, usando URL e chave pública Supabase de teste,
   chave Google Play SDK correta e opções de desenvolvimento desativadas.
5. AAB identificável para a faixa de teste escolhida, com o pacote Google Play
   registrado para as compras. Usar o mesmo pacote pode substituir a instalação
   existente: exporte o backup antes de trocar o ambiente do aparelho.
6. Usuários Supabase de teste que não se confundam com os UUIDs de produção.
7. Verificação das associações produto → entitlement → package e da política de
   restauração também no contexto de teste.

Se o seu `eas.json` não tem um perfil de homologação desse tipo, crie um; `preview` gera
APK interno e, por si só, não cria essa separação de backend.

## 15. Roteiro de testes e evidências

Registre evidência de cada teste no seu ambiente. Validar credenciais, RTDN e
webhook TEST não substitui os testes de compra listados abaixo.

| Teste | Resultado esperado |
|---|---|
| Credenciais Google | Valid credentials |
| Teste RTDN | Last received recente |
| Funções sem autenticação | HTTP 401 |
| Webhook TEST autenticado | HTTP 200 |
| Compra com cartão de teste | Registro sandbox no RevenueCat |
| Liberação do Pro | Direito confirmado no backend e no app |
| Restaurar na mesma conta | Recuperação sem nova cobrança |
| Restaurar em outra conta | Política de identidade respeitada |
| Cancelar renovação | Acesso até o vencimento pago |
| Expirar ou reembolsar | Acesso reconciliado com o provedor |

Para a compra ponta a ponta, use esta sequência:

1. Entre no app com um usuário de homologação conhecido.
2. Confirme build instalada, produto, preço localizado e renovação mensal.
3. Compre usando o cartão de teste da Play.
4. **RevenueCat → SeuApp → Customers**: encontre o UUID Supabase desse usuário.
5. Confira produto, compra sandbox e entitlement `pro`.
6. **RevenueCat → Integrations → Webhooks → webhook de homologação**: confira
   evento e resposta HTTP.
7. **Supabase de homologação → Edge Functions → billing-sync/revenuecat-webhook
   → Logs/Invocations**: confira o resultado sem registrar segredos.
8. Confira `paid_until` da conta e o acesso atualizado no aplicativo.
9. Teste cancelamento do checkout, compra pendente, perda de rede após pagamento,
   restauração, renovação, expiração e reembolso.

Se a compra foi paga mas a confirmação falhou, use **Atualizar acesso/restaurar**
conforme a tela; não instrua o usuário a comprar uma segunda vez.

## 16. Defina as regras de avaliação e acesso offline

O período de avaliação é uma decisão do produto. Se for uma oferta da Google
Play, configure suas condições na loja. Se for concedido pelo aplicativo,
implemente o início, a duração e o término no seu backend e cliente. Não
apresente uma avaliação própria como se fosse uma assinatura já contratada.

Para permitir uso offline, defina por quanto tempo o cliente pode confiar na
última confirmação de acesso e o que acontece quando esse prazo termina.
Considere o vencimento da assinatura, a necessidade de uma nova consulta e o
comportamento da interface sem rede. Não existe um prazo único para todos os apps.

Teste perda de conexão antes, durante e depois da compra. Uma confirmação
pendente deve oferecer um caminho de atualização ou restauração quando a rede
voltar. Não conceda acesso permanente apenas porque a consulta falhou.

Restaurar uma assinatura recupera o direito de acesso conforme a política de
identidade. A recuperação dos dados do aplicativo depende da arquitetura de
armazenamento, sincronização ou backup implementada separadamente.

## 17. Problemas encontrados e como diagnosticar

| Sintoma | O que conferir |
|---|---|
| Não aparece Criar assinatura | AAB com SDK Billing, pacote e configuração comercial |
| Não foi possível salvar a assinatura | Limites de texto e campos obrigatórios indicados no formulário |
| Ícone rejeitado | Arquivo selecionado, dimensões reais, RGBA e tamanho; não usar a prévia copiada |
| Credentials need attention | Mesmo e-mail no JSON e Play, app autorizado, permissões e APIs; depois propagação |
| API mostra erros em métodos | Percentual não identifica causa nem credencial; não é prova de API desativada |
| Pub/Sub não conecta | API ativa e permissão do publicador no tópico exato |
| Connected to Google, mas sem Last received | Nome completo salvo na Play e teste enviado; conexão sozinha não prova entrega |
| Webhook 401 | Authorization completo e igual ao secret do Supabase |
| Webhook 503 | Secrets presentes, chave v1 correta, acesso à API RevenueCat e schema/RPC publicados |
| TEST 200, mas compra não libera | TEST não verifica compra; confira ambiente, identidade, produto e entitlement |
| Compra sandbox não libera produção | Comportamento esperado com sandbox desabilitado |
| Assinaturas indisponíveis no app | Build correta e variável `goog_` incorporada no ambiente EAS |
| AAB novo enviado, app antigo ativo | Faixa, rascunho, revisão, publicação gerenciada e conta do testador |
| Não sei qual build está instalada | Exiba versão e número da build em uma tela de informações do aplicativo |

Execute também os advisors do Supabase após alterar o schema. Investigue os avisos
sobre RLS e funções privilegiadas; uma função intencionalmente SECURITY DEFINER
precisa de validações de identidade e privilégios revisados.

## 18. MCP: útil na configuração, dispensável para o app rodar

O MCP foi usado para criar o projeto, app, produto, entitlement, offering,
package e webhook. O login pode ser iniciado com:

```powershell
codex mcp login RevenueCat
```

O MCP é uma ferramenta administrativa. Usuários do SeuApp não dependem
do Codex/MCP para comprar ou usar a assinatura. O runtime utiliza SDK,
Google Play, API RevenueCat e Edge Functions.

Nem toda operação está disponível em toda sessão MCP. O Authorization do webhook
precisou ser preenchido pelo painel; a autenticação do Supabase também precisou
ser corrigida para alcançar a organização certa.

## 19. Checklist antes de considerar concluído

- [ ] Plano mensal ativo e preço correto.
- [ ] Produto associado ao entitlement e ao package da offering atual.
- [ ] Credenciais Google válidas e RTDN recebido.
- [ ] Chave pública no ambiente EAS correto e build instalada pela Play.
- [ ] Backend e migrations publicados no projeto correto.
- [ ] Webhook autenticado e filtrado por app/ambiente.
- [ ] Identidade do SDK e política de restauração conferidas.
- [ ] Compra sandbox liberando acesso somente na homologação.
- [ ] Restauração, cancelamento, renovação, expiração e reembolso testados.
- [ ] Termos e política de privacidade atualizados.

A integração está comprovada de ponta a ponta quando uma compra de teste produz
o direito correto no RevenueCat, no backend de homologação e no aplicativo.
