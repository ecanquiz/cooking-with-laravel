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

- **Mejore el rendimiento de su aplicación** - Dado que obtiene un subconjunto más pequeño de datos a la vez, hay menos datos para obtener de la base de datos, procesar/transformar y luego devolver.
- **Mejore la experiencia del usuario** - Es probable que al usuario solo le interese un pequeño subconjunto de datos a la vez (que normalmente se encuentra en las primeras páginas, especialmente si se utilizan filtros y términos de búsqueda). Al utilizar la paginación, puede evitar mostrar datos que no le interesan al usuario.
- **Mejore los tiempos de carga de la página** - Al obtener solo un subconjunto de los datos a la vez, puede reducir la cantidad de datos que deben cargarse en la página, lo que puede mejorar los tiempos de carga de la página y de procesamiento de JavaScript.

La paginación normalmente se puede dividir en dos tipos diferentes:

- **Paginación basada en desplazamiento** - Este es el tipo de paginación más común que probablemente encontrará en sus aplicaciones web, especialmente en las interfaces de usuario (IU). Implica obtener un subconjunto de datos de la base de datos en función de un "offset" y un "limit". Por ejemplo, puede obtener 10 registros a partir del registro número 20 para obtener la tercera página de datos.
- **Paginación basada en cursor** - Este tipo de paginación implica obtener un subconjunto de datos en función de un "cursor". El cursor suele ser un identificador único de un registro en la base de datos. Por ejemplo, puede obtener los siguientes 10 registros a partir del registro con un ID de 20.

Laravel proporciona tres métodos diferentes para paginar consultas Eloquent en sus aplicaciones:

- `paginate`: Utiliza **paginación basada en desplazamiento** y obtiene el número total de registros en el conjunto de datos.
- `simplePaginate` - Utiliza **paginación basada en desplazamiento**, pero no obtiene el número total de registros en el conjunto de datos.
- `cursorPaginate` - Utiliza **paginación basada en cursor** y no obtiene el número total de registros en el conjunto de datos.

Echemos un vistazo a cada uno de estos métodos con más detalle.

## Usando el método `paginate`

El método `paginate` le permite obtener un subconjunto de datos de la base de datos en función de un desplazamiento (offset) y un límite (los analizaremos más adelante cuando observemos las consultas SQL subyacentes).

Puedes utilizar el método `paginate` de la siguiente manera:

```php
use App\Models\User;
 
$users = User::query()->paginate();
```

Al ejecutar el código anterior, `$users` sería una instancia de `Illuminate\Contracts\Pagination\LengthAwarePaginator`, normalmente un objeto `Illuminate\Pagination\LengthAwarePaginator`. Esta instancia del paginador contiene toda la información que necesita para mostrar los datos paginados en su aplicación.

El método `paginate` puede determinar automáticamente el número de `página` solicitada en función del parámetro de consulta de página en la URL. Por ejemplo, si visitó `https://my-app.com/users?page=2`, el método `paginate` recuperaría la segunda página de datos.

De manera predeterminada, todos los métodos de paginación de Laravel obtienen 15 registros a la vez. Sin embargo, esto se puede cambiar a un valor diferente (veremos cómo hacerlo más adelante).

## Using paginate with Blade Views

