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
      { text: 'Comenzar', link: '/intro' },
      { text: 'ecanquiz', link: 'https://ecanquiz.github.io/' },     
    ],
    sidebar: [{      
      path: '/',      // optional, link of the title, which should be an absolute path and must exist        
      sidebarDepth: 1,    // optional, defaults to 1
      items: [
        { text: 'Introducción', link: '/intro' },
        { text: '* La Guía Definitiva para la Validación de Laravel', link: '/laravel-validation' },
        { text: '* Uso de Eloquent Factories con Proveedores de Datos PHPUnit', link: '/eloquent-factories-with-phpunit-data-providers' },
        { text: '* Afirmando una Estructura de Respuesta JSON en Laravel', link: '/asserting-json-response-structure-in-laravel' },
        { text: '* Aprenda a Dominar los Alcances de Consulta en Laravel', link: '/query-scopes' },
        { text: '* Una Guía para los Eventos Modelo de Laravel', link: '/model-events' },
      ]
    }],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ecanquiz/cooking-with-laravel' }
    ]
  }
})



