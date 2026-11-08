# Guias de integração

Acervo de artigos de Renan Rodolfo Dev. VitePress + Markdown, com busca local.

## Desenvolvimento

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Envie o projeto para a branch `main`.
2. No GitHub: **guias-de-integracao → Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Em **Actions → Publicar documentação**, acompanhe a execução. Se necessário, use **Run workflow**.
4. O endereço esperado é https://renaner123.github.io/guias-de-integracao/.

O workflow compila o conteúdo e publica `docs/.vitepress/dist`. O `base` já está
configurado para o nome deste repositório. A URL só estará disponível depois de
habilitar o Pages e concluir o primeiro deploy.

## Novo artigo

Crie `docs/guias/nome-do-guia.md`, com título H1, passos e referências. Inclua-o em
`docs/guias/index.md` e no `sidebar` de `docs/.vitepress/config.mts`. Para destacar
um artigo na capa, edite `docs/index.md`.

Use placeholders nos exemplos. Não publique credenciais, dumps, arquivos `.env`,
identificadores internos ou informações dos usuários dos projetos de origem.
