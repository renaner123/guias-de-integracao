# E-mails do Supabase Auth com Resend

Por Renan Rodolfo Dev

Configure o Resend como SMTP do Supabase para enviar confirmações de cadastro e códigos de recuperação de senha. O Supabase gera e valida os códigos, o Resend entrega as mensagens e o aplicativo conduz o usuário até a troca de senha.

## 1. Escolha o domínio e o remetente

1. Em **Resend → Domains**, escolha um domínio com status **Verified**. Se ainda precisar cadastrar um, clique em **Add Domain**, copie os registros DNS exibidos para a zona do domínio e aguarde a verificação.
2. Escolha um endereço no domínio exato que foi verificado. Se o domínio for `mail.example.com`, use, por exemplo, `conta@mail.example.com`.
3. Defina o nome de exibição, como **Meu App**. O endereço de envio pode usar um domínio que você já controla e verificou para outro projeto. Criar uma caixa de entrada só é necessário se você quiser receber mensagens naquele endereço.

Cada projeto Supabase tem sua própria configuração SMTP. Se dois projetos usarem o mesmo time do Resend, a cota de envio é compartilhada entre eles, inclusive com domínios e chaves diferentes. Consulte o painel de uso para acompanhar o consumo. [Remetentes no Resend](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend) · [Cotas por time](https://resend.com/changelog/three-domains-on-the-free-tier) · [Preços e limites](https://resend.com/pricing)

## 2. Crie uma chave de envio

Em **Resend → API Keys → Create API Key**, dê um nome que identifique o projeto, escolha **Sending access** e restrinja ao domínio do remetente. Guarde a chave no momento da criação. Ela será a senha SMTP no Supabase. Cadastre-a somente no painel do projeto ou no gerenciador de segredos da infraestrutura.

## 3. Configure o SMTP no Supabase

Abra **Supabase Dashboard → seu projeto → Authentication → Emails → SMTP Settings**. Ative **Custom SMTP**, preencha os campos e salve.

| Campo | Valor de exemplo |
| --- | --- |
| Sender name | `Meu App` |
| Sender email | `conta@mail.example.com` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Chave de envio criada no Resend |

O SMTP padrão do Supabase atende apenas endereços autorizados da equipe e tem uma cota baixa. No plano Free, projetos novos que usam o SMTP padrão também têm restrições de edição dos modelos. Ativar SMTP próprio permite editar os modelos e enviar a usuários externos. Depois de salvar, confira **Authentication → Rate Limits**. O limite de Auth do Supabase e a cota do Resend se aplicam separadamente. [SMTP no Supabase](https://supabase.com/docs/guides/auth/auth-smtp) · [Configuração do Resend](https://resend.com/changelog/smtp-service) · [Modelos no plano Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier)

## 4. Configure o modelo de recuperação

Em **Authentication → Emails → Reset password**, abra o editor. Use um assunto como **Código para recuperar sua senha** e cole este HTML em **Body**.

```html
<h2>Recuperação de senha</h2>
<p>Digite este código na tela de recuperação do aplicativo.</p>
<p><strong>{{ .Token }}</strong></p>
<p>Se você não solicitou a recuperação, ignore este e-mail.</p>
```

Salve preservando <code v-pre>{{ .Token }}</code>. O Supabase substitui essa variável pelo código de uso único. A recuperação por código dispensa configurar um redirecionamento para abrir o app. Se preferir recuperação por link, use um fluxo com <code v-pre>{{ .ConfirmationURL }}</code> e configure a URL de retorno e a lista de URLs permitidas em **Authentication → URL Configuration**. [Variáveis dos modelos de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates) · [URLs de redirecionamento](https://supabase.com/docs/guides/auth/redirect-urls)

## 5. Conecte o fluxo ao aplicativo

Use `@supabase/supabase-js` e as credenciais públicas do projeto. O exemplo usa um cliente de recuperação separado, mantido durante as duas telas do fluxo. Assim, a sessão que autoriza a troca de senha não interfere na navegação do login normal.

```ts
import { createClient } from '@supabase/supabase-js'

const recovery = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storageKey: 'password-recovery',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function requestRecovery(email: string) {
  const { error } = await recovery.auth.resetPasswordForEmail(email.trim())
  if (error) throw error
}

async function verifyRecoveryCode(email: string, code: string) {
  const { data, error } = await recovery.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'recovery',
  })
  if (error) throw error
  if (!data.session) throw new Error('Não foi possível validar o código.')
}

async function changePassword(password: string) {
  const { error } = await recovery.auth.updateUser({ password })
  if (error) throw error
}
```

1. Em **Esqueci minha senha**, peça o e-mail e chame `requestRecovery`. Após o pedido, mostre uma mensagem genérica, como “Se houver uma conta para esse e-mail, você receberá um código”.
2. Na próxima etapa, receba o código e chame `verifyRecoveryCode` com o mesmo e-mail. Trate código inválido ou vencido e ofereça reenvio respeitando o intervalo do Supabase.
3. Valide a nova senha conforme a política do projeto, confira a confirmação e chame `changePassword`. Se a atualização falhar com a sessão de recuperação ainda válida, permita tentar novamente sem consumir outro código.
4. Após sucesso, descarte o cliente temporário e volte ao login. Evite registrar códigos, senhas ou tokens nos logs.

[Solicitar recuperação](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) · [Verificar código](https://supabase.com/docs/reference/javascript/auth-verifyotp) · [Atualizar senha](https://supabase.com/docs/reference/javascript/auth-updateuser)

## 6. Teste de ponta a ponta

1. Use um e-mail fora da equipe do Supabase. Se o cadastro exige confirmação, crie a conta, abra a mensagem e confirme que o login funciona.
2. Saia da conta e solicite a recuperação pelo aplicativo. Em **Resend → Emails**, encontre o envio pelo destinatário e confira o status. Na caixa de entrada, verifique remetente, assunto e código.
3. Tente um código incorreto e confira se o app oferece uma forma de corrigir ou reenviar. Em seguida, use o código válido para cadastrar uma senha nova.
4. No login normal, confira que a senha antiga é recusada e a nova funciona. Tente reutilizar o código consumido para verificar que ele é rejeitado.

## 7. Diagnostique falhas comuns

| Sintoma | Onde conferir |
| --- | --- |
| Modelo bloqueado para edição | Confira se o **Custom SMTP** foi salvo e está ativo no mesmo projeto que o app usa. |
| Destinatário não autorizado | Confira se o Supabase está usando SMTP próprio. No Resend, o domínio de teste `resend.dev` também restringe destinatários. |
| Erro de autenticação SMTP | Confira host, porta, usuário literal `resend`, validade da chave e permissão de envio para o domínio. |
| Remetente recusado | Compare o domínio após o `@` com o domínio exato marcado **Verified**. |
| Nenhum envio aparece no Resend | Confira os logs de Auth no Supabase, a URL do projeto usada pelo app e os limites em **Authentication → Rate Limits**. |
| O envio aparece, mas o e-mail não chega | Confira o status e os detalhes do evento no Resend, além da caixa de spam. |
| O e-mail chegou só com um link | Revise o corpo de **Reset password** no projeto usado pelo build e confirme a presença de <code v-pre>{{ .Token }}</code>. |
| Código rejeitado | Confira o e-mail do pedido, a validade do código e se a verificação usa `type: 'recovery'`. |

[Domínio de teste do Resend](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) · [Limites do Supabase Auth](https://supabase.com/docs/guides/auth/rate-limits)
