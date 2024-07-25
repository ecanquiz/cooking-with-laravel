import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Cocinando con Laravel',
  description: 'Un framework para crear aplicaciones PHP modernas',
  base: '/cooking-with-laravel/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/me.jpg',
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Comenzar', link: '/why-laravel' },
      { text: 'ecanquiz', link: 'https://ecanquiz.github.io/' },     
    ],
    sidebar: [{      
      path: '/',      // optional, link of the title, which should be an absolute path and must exist        
      sidebarDepth: 1,    // optional, defaults to 1
      items: [
        { text: 'La guía definitiva para la validación de Laravel', link: '/laravel-validation' },
        { text: 'Entorno de Desarrollo', link: 'set-up-laravel-dev-env' },
      ]
    }],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ecanquiz/cooking-with-laravel' }
    ]
  }
})



