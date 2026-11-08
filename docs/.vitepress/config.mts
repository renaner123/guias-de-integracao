import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'pt-BR',
  title: 'Guias de integração',
  description: 'Integrações na prática, por Renan Rodolfo Dev. Passos completos, configurações e testes.',
  base: '/guias-de-integracao/',
  cleanUrls: false,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#087f72' }]],
  themeConfig: {
    siteTitle: 'Guias de integração',
    nav: [
      { text: 'Guias', link: '/guias/' },
      { text: 'Sobre o acervo', link: '/sobre' }
    ],
    sidebar: {
      '/guias/': [{ text: 'Integrações na prática', items: [
        { text: 'Todos os guias', link: '/guias/' },
        { text: 'Assinaturas no Android', link: '/guias/assinaturas-android' }
      ] }]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/renaner123/guias-de-integracao' }],
    search: { provider: 'local', options: { locales: { root: { translations: {
      button: { buttonText: 'Buscar', buttonAriaLabel: 'Buscar nos guias' },
      modal: { noResultsText: 'Nenhum resultado para', resetButtonTitle: 'Limpar busca', footer: { selectText: 'selecionar', navigateText: 'navegar', closeText: 'fechar' } }
    } } } } },
    outline: { level: 2, label: 'Neste guia' },
    docFooter: { prev: 'Anterior', next: 'Próximo' },
    lastUpdated: { text: 'Atualizado em', formatOptions: { dateStyle: 'long' } },
    editLink: { pattern: 'https://github.com/renaner123/guias-de-integracao/edit/main/docs/:path', text: 'Sugerir alteração nesta página' },
    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Usar tema claro',
    darkModeSwitchTitle: 'Usar tema escuro',
    skipToContentLabel: 'Ir para o conteúdo',
    footer: { message: 'Documentação por Renan Rodolfo Dev. Confira as referências e a data de cada guia.' }
  }
})
