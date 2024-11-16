# Una Guía para la Paginación en Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/laravel-pagination)
:::

![laravel-pagination](./img/laravel-pagination.avif)

La paginación es una característica común en las aplicaciones web. Casi todas las aplicaciones de Laravel en las que he trabajado han tenido algún tipo de paginación implementada.

Pero, ¿qué es la paginación y por qué la usamos? ¿Cómo podemos implementar la paginación en nuestras aplicaciones de Laravel? ¿Y cómo decidimos qué método de paginación usar?

En este artículo, responderemos esas mismas preguntas y exploraremos cómo usar la paginación en Laravel tanto para las vistas de Blade como para los puntos finales de API. Al final de este artículo, debería sentirse lo suficientemente seguro como para comenzar a usar la paginación en sus propios proyectos.

## ¿Qué es la Paginación?

La paginación es una técnica que se utiliza para dividir un conjunto de datos grande en fragmentos más pequeños (o páginas). Permite mostrar un subconjunto de los datos, en lugar de todos los valores posibles a la vez.

Por ejemplo, imagina que tienes una página que muestra los nombres de todos los usuarios de tu aplicación. Si tienes miles de usuarios, no sería práctico mostrarlos todos en una sola página. En su lugar, puedes utilizar la paginación para mostrar un subconjunto de los usuarios (por ejemplo, 10 usuarios a la vez) en cada página y permitir que los usuarios naveguen entre las páginas para ver más usuarios (los siguientes 10).

Al utilizar la paginación, puedes:

