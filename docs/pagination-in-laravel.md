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

### Uso de `paginate` con Blade Views

Veamos cómo utilizar el método `paginate` al representar datos en una vista de Blade.

Imaginemos que tenemos una ruta simple que obtiene los usuarios de la base de datos en un formato paginado y los pasa a una vista:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    $users = User::query()->paginate();
 
    return view('users.index', [
        'users' => $users,
    ]);
});
```

Nuestro archivo `resources/views/users/index.blade.php` podría verse así:


```html
<html>
<head>
    <title>Paginate</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
 
<body>
    <div class="max-w-5xl mx-auto py-8">
        <h1 class="text-5xl">Paginate</h1>
 
        <ul class="py-4">
            @foreach ($users as $user)
                <li class="py-1 border-b">{{ $user->name }}</li>
            @endforeach
        </ul>
 
        {{ $users->links() }}
    </div>
</body>
</html>
```

La página resultante se vería así:

![laravel-pagination-1](./img/laravel-pagination-1.avif)

Analicemos lo que sucede en la vista Blade:

- Estamos recorriendo cada usuario que está presente en el campo `$users` (el objeto `Illuminate\Pagination\LengthAwarePaginator`) y mostrando su nombre.
- Estamos llamando al método `links` en el objeto `$users`. Este es un método muy útil que devuelve algo de HTML que muestra los enlaces de paginación (por ejemplo, _"Previous"_, _"Next"_ y los números de página). Esto significa que no tiene que preocuparse por crear los enlaces de paginación usted mismo, y Laravel se encargará de todo eso por usted.

También podemos ver que el método `paginate` nos brinda una descripción general de los datos de paginación. Podemos ver que estamos viendo los registros del 16 al 30, de un total de 50 registros. También podemos ver que estamos en la segunda página y que hay un total de 4 páginas.

Es importante tener en cuenta que el método `links` devolverá el HTML con estilo usando Tailwind CSS. Si desea utilizar algo distinto de Tailwind o desea darle estilo a los enlaces de paginación usted mismo, puede consultar la documentación sobre cómo [personalizar las vistas de paginación](https://laravel.com/docs/11.x/pagination#customizing-the-pagination-view).


### Uso de `paginate` en Puntos Finales de API

Además de utilizar el método `paginate` en las vistas de Blade, también puedes usarlo en los puntos finales de la API. Laravel facilita este proceso al convertir automáticamente los datos paginados en JSON.

Por ejemplo, podríamos construir un punto final `/api/users` (agregando la siguiente ruta a nuestro archivo `routes/api.php`) que devuelva los usuarios paginados en formato JSON:


```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('paginate', function () {
    return User::query()->paginate();
});
```

Acceder al punto final `/api/users` devolvería una respuesta JSON similar a la siguiente (tenga en cuenta que he limitado el campo `data` a solo 3 registros por razones de brevedad):

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Andy Runolfsson",
      "email": "teresa.wiegand@example.net",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 2,
      "name": "Rafael Cummings",
      "email": "odessa54@example.org",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 3,
      "name": "Reynold Lindgren",
      "email": "juwan.johns@example.net",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    }
  ],
  "first_page_url": "http://example.com/users?page=1",
  "from": 1,
  "last_page": 4,
  "last_page_url": "http://example.com/users?page=4",
  "links": [
    {
      "url": null,
      "label": "&laquo; Previous",
      "active": false
    },
    {
      "url": "http://example.com/users?page=1",
      "label": "1",
      "active": true
    },
    {
      "url": "http://example.com/users?page=2",
      "label": "2",
      "active": false
    },
    {
      "url": "http://example.com/users?page=3",
      "label": "3",
      "active": false
    },
    {
      "url": "http://example.com/users?page=4",
      "label": "4",
      "active": false
    },
    {
      "url": "http://example.com/users?page=5",
      "label": "5",
      "active": false
    },
    {
      "url": "http://example.com/users?page=2",
      "label": "Next &raquo;",
      "active": false
    }
  ],
  "next_page_url": "http://example.com/users?page=2",
  "path": "http://example.com/users",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 50
}
```

Analicemos la respuesta JSON:

- `current_page` - La página actual en la que nos encontramos. En este caso, estamos en la primera página.
- `data` - Los datos reales que se están devolviendo. En este caso, contienen los primeros 15 usuarios (abreviados a 3 para abreviar).
- `first_page_url` - La URL a la primera página de datos.
- `from` - El número de registro inicial de los datos que se están devolviendo. En este caso, es el primer registro. Si estuviéramos en la segunda página, sería 16.
- `last_page` - El número total de páginas de datos. En este caso, hay 4 páginas.
- `last_page_url` - La URL a la última página de datos.
- `links` - Una matriz de enlaces a las diferentes páginas de datos. Esto incluye los enlaces _"Previous"_ y _"Next"_, así como los números de página.
- `next_page_url` - La URL a la siguiente página de datos.
- `path` - La URL base del punto final.
- `per_page` - La cantidad de registros que se devuelven por página. En este caso, son 15.
- `prev_page_url` - La URL de la página de datos anterior. En este caso, es nula porque estamos en la primera página. Si estuviéramos en la segunda página, esta sería la URL de la primera página.
- `to` - El número de registro final de los datos que se devuelven. En este caso, es el registro número 15. Si estuviéramos en la segunda página, sería 30.
- `total` - La cantidad total de registros en el conjunto de datos. En este caso, hay 50 registros.


### Las Consultas SQL Subyacentes

El uso del método `paginate` en Laravel da como resultado la ejecución de dos consultas SQL:

- La primera consulta recupera la cantidad total de registros en el conjunto de datos. Esto se utiliza para determinar información como la cantidad total de páginas y la cantidad total de registros.
- La segunda consulta recupera el subconjunto de datos en función de los valores de desplazamiento y límite. Por ejemplo, podría estar recuperando los usuarios para que los procesemos y los devolvamos.

Por lo tanto, si quisiéramos recuperar la primera página de usuarios (con 15 usuarios por página), se ejecutarían las siguientes consultas SQL:

```sql
select count(*) as aggregate from `users`
```

y

```sql
select * from `users` limit 15 offset 0
```

En la segunda consulta, podemos ver que el valor `limit` está establecido en 15. Esta es la cantidad de registros que se devuelven por página.

El valor de `offset` se calcula de la siguiente manera:

```
Offset = Page size * (Page - 1)
```

Entonces, si quisiéramos obtener la tercera página de usuarios, el valor `offset` se calcularía como:

```
Offset = 15 * (3 - 1)
```

Por lo tanto, el valor de `offset` sería 30 y buscaríamos los registros del 31 al 45. Las consultas para la tercera página se verían así:

```sql
select count(*) as aggregate from `users`
```

y

```sql
select * from `users` limit 15 offset 30
```

## Utilizando el método `simplePaginate`

El método `simplePaginate` es muy similar al método `paginate` pero con una diferencia clave. El método `simplePaginate` no recupera la cantidad total de registros en el conjunto de datos.

Como acabamos de ver, cuando utilizamos el método `paginate`, también obtenemos información sobre la cantidad total de registros y páginas disponibles en el conjunto de datos. Luego, podemos utilizar esta información para mostrar elementos como la cantidad total de páginas en la respuesta de la interfaz de usuario o de la API.

Pero si no tiene intención de mostrar estos detalles al usuario (o al desarrollador que consume la API), podemos evitar una consulta de base de datos innecesaria (que cuenta la cantidad total de registros) utilizando el método `simplePaginate`.

El método `simplePaginate` se puede utilizar de la misma manera que el método `paginate`:

```php
use App\Models\User;
 
$users = User::query()->simplePaginate();
```

Al ejecutar el código anterior, `$users` sería una instancia de `Illuminate\Contracts\Pagination\Paginator`, normalmente un objeto `Illuminate\Pagination\Paginator`.

A diferencia del objeto `Illuminate\Pagination\LengthAwarePaginator` devuelto por el método `paginate`, el objeto `Illuminate\Pagination\Paginator` no contiene información sobre la cantidad total de registros en el conjunto de datos y no tiene idea de cuántas páginas o registros totales hay. Solo sabe sobre la página actual de datos y si hay más registros para recuperar.

### Uso de `simplePaginate` con vistas Blade

Veamos cómo se puede utilizar el método `simplePaginate` con una vista Blade. Supondremos que tenemos la misma ruta que antes, pero esta vez utilizaremos el método `simplePaginate`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    $users = User::query()->simplePaginate();
 
    return view('users.index', [
        'users' => $users,
    ]);
});
```

Construiremos nuestra vista Blade de la misma manera que antes:

```html
<html>
<head>
    <title>Simple Paginate</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
 
<body>
    <div class="max-w-5xl mx-auto py-8">
        <h1 class="text-5xl">Simple Paginate</h1>
 
        <ul class="py-4">
            @foreach ($users as $user)
                <li class="py-1 border-b">{{ $user->name }}</li>
            @endforeach
        </ul>
 
        {{ $users->links() }}
    </div>
</body>
</html>
```

La página resultante se vería así:

![laravel-pagination-1](./img/laravel-pagination-2.avif)

Como podemos ver en este ejemplo, la salida de `$users->links()` es diferente a la salida que vimos al usar el método `paginate`. Dado que el método `simplePaginate` no obtiene el número total de registros, no tiene contexto del número total de páginas o registros, solo si hay una página siguiente o no. Por lo tanto, solo vemos los enlaces _"Previous"_ y _"Next"_ en los enlaces de paginación.

### Uso de `simplePaginate` en puntos finales de API

También puedes usar el método `simplePaginate` en los puntos finales de la API. Laravel convertirá automáticamente los datos paginados en JSON.

Construyamos un punto final `/api/users` que devuelva los usuarios paginados en formato JSON:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    return User::query()->simplePaginate();
});
```

Cuando llegamos a esta ruta, obtendremos una respuesta JSON similar a la siguiente (he limitado el campo `data` a solo 3 registros para abreviar):

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Andy Runolfsson",
      "email": "teresa.wiegand@example.net",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 2,
      "name": "Rafael Cummings",
      "email": "odessa54@example.org",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 3,
      "name": "Reynold Lindgren",
      "email": "juwan.johns@example.net",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    }
  ],
  "first_page_url": "http://example.com/users?page=1",
  "from": 1,
  "next_page_url": "http://example.com/users?page=2",
  "path": "http://example.com/users",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15
}
```

Como podemos ver, la respuesta JSON es muy similar a la que obtuvimos al usar el método `paginate`. La diferencia clave es que no tenemos los campos `last_page`, `last_page_url`, `links` o `total` en la respuesta.

### Las Consultas SQL Subyacentes

Echemos un vistazo a las consultas SQL subyacentes que se ejecutan cuando se utiliza el método `simplePaginate`.

El método `simplePaginate` todavía depende de los valores `limit` y `offset` para obtener el subconjunto de datos de la base de datos. Sin embargo, no ejecuta la consulta para obtener la cantidad total de registros en el conjunto de datos.

El valor `offset` todavía se calcula de la misma manera que antes:

```
Offset = Page size * (Page - 1)
```

Sin embargo, el valor de `límite` se calcula de forma ligeramente diferente al método `paginate`. Se calcula de la siguiente manera:

```
Limit = Page size + 1
```

Esto se debe a que el método `simplePaginate` necesita obtener un registro más que el valor `perPage` para determinar si hay más registros para obtener. Por ejemplo, digamos que estamos obteniendo 15 registros por página. El valor `limit` sería 16. Por lo tanto, si se devolvieran 16 registros, sabríamos que hay al menos una página más de datos disponibles para obtener. Si se devolvieran menos de 16 registros, sabríamos que estamos en la última página de datos.

Por lo tanto, si quisiéramos obtener la primera página de usuarios (con 15 usuarios por página), se ejecutarían las siguientes consultas SQL:


```sql
select * from `users` limit 16 offset 0
```

La consulta para la segunda página se vería así:

```sql
select * from `users` limit 16 offset 15
```

## Usando el método `cursorPaginate`

Hasta ahora hemos analizado los métodos `paginate` y `simplePaginate`, que utilizan paginación basada en desplazamiento. Ahora vamos a analizar el método `cursorPaginate`, que utiliza paginación basada en cursor.

Como advertencia, la paginación basada en cursor puede parecer un poco confusa la primera vez que la conoces. Así que no te preocupes si no la entiendes bien al principio. Con suerte, al final de este artículo, comprenderás mejor cómo funciona. También dejaré un video increíble al final de este artículo que explica la paginación basada en cursor con más detalle.

Con la paginación basada en desplazamiento, utilizamos los valores `limit` y `offset` para obtener un subconjunto de datos de la base de datos. Por lo tanto, podemos decir _"omitir los primeros 10 registros y obtener los siguientes 10 registros"_. Esto es fácil de entender y de implementar. Mientras que con la paginación por cursor, utilizamos un cursor (normalmente un identificador único para un registro específico en la base de datos) como punto de partida para obtener el conjunto de registros anterior/siguiente.

Por ejemplo, supongamos que hacemos una consulta para obtener los primeros 15 usuarios. Supondremos que el ID del usuario número 15 es 20. Cuando queramos obtener los siguientes 15 usuarios, utilizaremos el ID del usuario número 15 (20) como cursor. Diremos _"obtener los siguientes 15 usuarios con un ID mayor que 20"_.

Es posible que a veces veas cursores a los que se hace referencia como _"tokens"_, _"keys"_, _"next"_, _"previous"_, etc. Básicamente, son una referencia a un registro específico en la base de datos. Veremos la estructura de los cursores más adelante en esta sección cuando echemos un vistazo a las consultas SQL subyacentes.

Laravel nos permite usar fácilmente la paginación basada en cursores con el método `cursorPaginate`:

```php
use App\Models\User;
 
$users = User::query()->cursorPaginate();
```

Al ejecutar el código anterior, el campo `$users` sería una instancia de `Illuminate\Contracts\Pagination\CursorPaginator`, normalmente un objeto `Illuminate\Pagination\CursorPaginator`. Esta instancia del paginador contiene toda la información que necesita para mostrar los datos paginados en su aplicación.

De manera similar al método `simplePaginate`, el método `cursorPaginate` no recupera la cantidad total de registros en el conjunto de datos. Solo conoce la página actual de datos y si hay más registros para recuperar, por lo que no conocemos de inmediato la cantidad total de páginas o registros.

### Using cursorPaginate with Blade Views



