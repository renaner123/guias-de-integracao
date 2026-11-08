# Nome e logo no login com Google: branding OAuth com Supabase

Publicado em 8 de novembro de 2026 · Por Renan Rodolfo Dev

Ao entrar em um site com Google, a tela de autorização pode mostrar um endereço como `<project-ref>.supabase.co`. Neste guia, vamos configurar e publicar a marca do aplicativo para que o usuário reconheça o nome e a logo do produto durante o login.

O procedimento foi realizado em um projeto que já usava o login Google pelo Supabase. Após verificar o domínio e publicar o branding, o teste confirmou o nome e a logo do produto no lugar do identificador do Supabase na tela observada.

::: info Exemplos e provedor de DNS
A configuração de DNS deste procedimento foi feita na **Hostinger**. Os passos são semelhantes em outros provedores: localizar a zona DNS, adicionar o registro TXT fornecido pelo Google e verificar a propriedade. Os nomes dos menus e campos podem variar.

Usaremos `seuapp.com.br` e `SeuApp` como exemplos. Substitua pelos dados do seu produto. Os menus dos serviços também podem mudar com o tempo.
:::

## 1. Entenda as configurações envolvidas

| Configuração | Responsabilidade |
|---|---|
| Provedor Google no Supabase | Define o cliente OAuth utilizado no login. |
| Google Auth Platform | Configura o público, a identidade visual e a publicação da marca. |
| Google Search Console | Comprova ao Google que você controla o domínio. |
| DNS do domínio | Recebe o registro TXT usado nessa comprovação. |

Existem dois momentos diferentes: **publicar o aplicativo OAuth**, saindo do status de teste, e **publicar o branding aprovado**. Salvar nome e logo não conclui essas duas etapas.

O branding também não troca o endpoint do Supabase. Se o objetivo for substituir o endereço de autenticação por `auth.seuapp.com.br`, isso envolve configurar um domínio personalizado separadamente. A documentação do [login Google no Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google#setup-consent-screen-branding) apresenta essas opções.

## 2. Encontre o projeto Google Cloud correto

Quando há várias contas ou projetos, comece pelo identificador já utilizado na integração:

1. Entre no [Supabase Dashboard](https://supabase.com/dashboard) e abra o projeto do aplicativo.
2. Acesse **Authentication → Sign In / Providers → Google**.
3. Copie o **Client ID**, terminado em `.apps.googleusercontent.com`.
4. Abra [Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients).
5. Selecione os projetos disponíveis e compare os Client IDs até encontrar uma correspondência exata.
6. Se não encontrar, confira as outras contas Google pelo avatar do console.

O nome do projeto sozinho não garante que você encontrou a integração correta. A correspondência do Client ID é a referência. Você não precisa copiar ou divulgar o **Client Secret** para identificar o projeto.

## 3. Prepare o site e a logo

Tenha uma página inicial pública que apresente o produto e permita acessar a política de privacidade e os termos de uso. Os dados do site devem ser coerentes com a marca cadastrada no OAuth.

Para a logo, a documentação do Google aceita **PNG, JPG e BMP**, com tamanho de até **1 MB**, e recomenda uma imagem quadrada de **120 × 120 pixels**. Confira os [requisitos atuais de branding](https://support.google.com/cloud/answer/15549049?hl=en).

No procedimento realizado, foi utilizada uma versão PNG de **256 × 256 pixels**, com aproximadamente **61 KB**, aceita pelo painel. Esse é um exemplo de arquivo que funcionou; para novos uploads, considere a recomendação atual do Google.

Antes de enviar, confira se o símbolo continua legível quando pequeno e se há espaço suficiente ao redor dele.

## 4. Preencha o branding

No projeto correspondente ao Client ID:

1. Abra [Google Auth Platform → Branding](https://console.cloud.google.com/auth/branding).
2. Informe o nome público do aplicativo.
3. Selecione o e-mail de suporte e envie a logo.
4. Preencha as URLs da página inicial, da política de privacidade e dos termos de uso.
5. Confira os domínios autorizados e os contatos do desenvolvedor.
6. Salve as informações.

Use URLs reais e acessíveis, como `https://www.seuapp.com.br`. Ter o domínio cadastrado no branding não comprova, por si só, que você é proprietário dele.

## 5. Saia do status de teste quando o login estiver pronto

Se o aplicativo estiver em **Teste (Testing)**, abra [Audience / Público-alvo](https://console.cloud.google.com/auth/audience) e use **Publicar aplicativo** quando estiver pronto para disponibilizar o OAuth em produção.

Essa ação altera a disponibilidade da autorização Google. Ela não faz deploy do site nem exige trocar as credenciais já cadastradas no Supabase. As regras de acesso aos dados do aplicativo continuam sendo responsabilidade da aplicação e do backend.

Para login básico, confira os escopos de identidade utilizados, como `openid`, e-mail e perfil. Permissões adicionais, especialmente sensíveis ou restritas, podem envolver outras análises. Consulte a [visão geral dos estados OAuth](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview).

Publicar o OAuth não contrata um plano pago do Supabase nem ativa um domínio personalizado. Serviços adicionais têm condições de cobrança próprias e devem ser avaliados separadamente.

## 6. Comprove a propriedade do domínio

Uma pendência encontrada durante o processo foi a mensagem de que o site da página inicial não estava registrado para a conta utilizada.

A correção foi verificar o domínio no Search Console pelo DNS. Para evitar divergências de permissão, utilize uma conta proprietária do projeto Google Cloud. Confira as [orientações de verificação de domínio](https://support.google.com/cloud/answer/13804266?hl=en).

### Adicione uma propriedade de domínio

1. Abra o [Google Search Console](https://search.google.com/search-console).
2. No seletor de propriedades, escolha **Adicionar propriedade**.
3. Selecione **Domínio**.
4. Digite `seuapp.com.br`, sem protocolo, caminho ou `www`.
5. Selecione o método **TXT** e copie o valor completo fornecido.

Uma propriedade de domínio abrange seus subdomínios, incluindo `www`. Para esse procedimento, use esse tipo de propriedade em vez de cadastrar somente um prefixo de URL.

### Adicione o TXT na Hostinger

Neste caso, o domínio era gerenciado na **Hostinger**. No hPanel, o caminho utilizado corresponde à área de **Domínios → domínio escolhido → DNS / Nameservers → Registros DNS**. Procure a zona DNS caso os nomes tenham mudado.

Crie um novo registro:

| Campo | Valor de exemplo |
|---|---|
| Tipo | `TXT` |
| Nome / Host | `@`, indicando o domínio raiz |
| Valor / Conteúdo | `google-site-verification=CODIGO_FORNECIDO_PELO_GOOGLE` |
| TTL | Padrão do provedor |

Copie o valor real da sua tela. Preserve os outros registros da zona, inclusive outros TXT.

**Em outros provedores, a lógica é a mesma:** abrir o gerenciador DNS do domínio e adicionar o TXT no domínio raiz. O campo de nome pode usar `@`, ficar vazio ou pedir o domínio completo, conforme o painel. Siga a convenção do provedor.

Se você comprou o domínio na Hostinger, mas utiliza nameservers de outro serviço, faça a alteração no serviço que efetivamente gerencia o DNS.

### Confirme no Google

1. Salve o registro DNS.
2. Volte ao Search Console e clique em **Verificar**.
3. Se o registro ainda não for encontrado, aguarde a propagação e tente novamente.
4. Depois da confirmação, mantenha o TXT publicado.

Veja também o [guia do Search Console para verificar propriedade](https://support.google.com/webmasters/answer/9008080?hl=pt-BR).

## 7. Resolva a pendência e verifique a marca

Volte ao Branding ou à [Central de verificação](https://console.cloud.google.com/auth/verification).

No caso documentado, a mensagem de erro orientava aguardar **24 horas** após comprovar a propriedade, para atualização dos sistemas. Se essa orientação aparecer no seu painel, respeite o prazo antes de repetir a solicitação. A propagação do TXT e a atualização dos sistemas OAuth são etapas distintas.

Quando o problema estiver corrigido, selecione **Corrigi os problemas** e avance para solicitar uma nova verificação. Se houver contato da equipe de análise por e-mail, siga também as instruções recebidas.

Se a propriedade já estiver confirmada e a pendência persistir, confira a conta Google, o acesso ao projeto e o tipo de propriedade criada antes de solicitar outra análise.

## 8. Publique o branding aprovado

Após a aprovação, confira se o botão **Publicar branding (Publish branding)** está disponível e conclua a publicação.

As alterações de marca ficam como rascunho até que o processo de verificação e publicação seja concluído. Isso explica por que salvar os campos ou apenas colocar o aplicativo em produção pode não mudar imediatamente a tela do login. Veja o [fluxo oficial de verificação de marca](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification).

## 9. Teste o login completo

1. Abra o site em uma janela anônima.
2. Clique em **Entrar com Google**.
3. Confira o nome e a logo na autorização, quando essa tela for apresentada.
4. Conclua o login e confirme o retorno correto ao aplicativo.

Se uma conta já autorizada não exibir o consentimento novamente, teste com outra conta sob seu controle que ainda não tenha autorizado o aplicativo.

No teste que originou este artigo, a publicação fez a tela observada mostrar a identidade do produto e deixar de mostrar o identificador `supabase.co`. Isso foi resolvido pelo branding, sem contratar domínio personalizado. O endereço técnico de callback continuou sendo o da integração existente; a aparência pode variar entre as telas do fluxo.

## Referências

- [Supabase: login com Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Google: configurações e requisitos de branding](https://support.google.com/cloud/answer/15549049?hl=en)
- [Google: verificação de domínio para OAuth](https://support.google.com/cloud/answer/13804266?hl=en)
- [Search Console: verificar propriedade de um site](https://support.google.com/webmasters/answer/9008080?hl=pt-BR)
- [Google: estados do aplicativo OAuth](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview)
- [Google: envio para verificação de marca](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
