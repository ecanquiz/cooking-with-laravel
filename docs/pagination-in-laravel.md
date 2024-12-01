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

## Usando el Método `paginate`

El método `paginate` le permite obtener un subconjunto de datos de la base de datos en función de un desplazamiento (offset) y un límite (los analizaremos más adelante cuando observemos las consultas SQL subyacentes).

Puedes utilizar el método `paginate` de la siguiente manera:

```php
use App\Models\User;
 
$users = User::query()->paginate();
```

Al ejecutar el código anterior, `$users` sería una instancia de `Illuminate\Contracts\Pagination\LengthAwarePaginator`, normalmente un objeto `Illuminate\Pagination\LengthAwarePaginator`. Esta instancia del paginador contiene toda la información que necesita para mostrar los datos paginados en su aplicación.

El método `paginate` puede determinar automáticamente el número de `página` solicitada en función del parámetro de consulta de página en la URL. Por ejemplo, si visitó `https://my-app.com/users?page=2`, el método `paginate` recuperaría la segunda página de datos.

De manera predeterminada, todos los métodos de paginación de Laravel obtienen 15 registros a la vez. Sin embargo, esto se puede cambiar a un valor diferente (veremos cómo hacerlo más adelante).

### Usando el `paginate` con Vistas Blade

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

![laravel-pagination](./img/laravel-pagination-1.avif)

Analicemos lo que sucede en la vista Blade:

- Estamos recorriendo cada usuario que está presente en el campo `$users` (el objeto `Illuminate\Pagination\LengthAwarePaginator`) y mostrando su nombre.
- Estamos llamando al método `links` en el objeto `$users`. Este es un método muy útil que devuelve algo de HTML que muestra los enlaces de paginación (por ejemplo, _"Previous"_, _"Next"_ y los números de página). Esto significa que no tiene que preocuparse por crear los enlaces de paginación usted mismo, y Laravel se encargará de todo eso por usted.

También podemos ver que el método `paginate` nos brinda una descripción general de los datos de paginación. Podemos ver que estamos viendo los registros del 16 al 30, de un total de 50 registros. También podemos ver que estamos en la segunda página y que hay un total de 4 páginas.

Es importante tener en cuenta que el método `links` devolverá el HTML con estilo usando Tailwind CSS. Si desea utilizar algo distinto de Tailwind o desea darle estilo a los enlaces de paginación usted mismo, puede consultar la documentación sobre cómo [personalizar las vistas de paginación](https://laravel.com/docs/11.x/pagination#customizing-the-pagination-view).


### Usando el `paginate` en Puntos Finales de API

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

## Usando el Método `simplePaginate`

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

### Usando el `simplePaginate` con Vistas Blade

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

![laravel-pagination](./img/laravel-pagination-2.avif)

Como podemos ver en este ejemplo, la salida de `$users->links()` es diferente a la salida que vimos al usar el método `paginate`. Dado que el método `simplePaginate` no obtiene el número total de registros, no tiene contexto del número total de páginas o registros, solo si hay una página siguiente o no. Por lo tanto, solo vemos los enlaces _"Previous"_ y _"Next"_ en los enlaces de paginación.

### Usando el `simplePaginate` en Puntos Finales de API

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

## Usando el Método `cursorPaginate`

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

### Usando el `cursorPaginate` con Vistas Blade

Veamos cómo utilizar el método `cursorPaginate` al representar datos en una vista de Blade. De manera similar a nuestros ejemplos anteriores, supondremos que tenemos una ruta simple que obtiene los usuarios de la base de datos en un formato paginado y los pasa a una vista:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    $users = User::query()->cursorPaginate();
 
    return view('users.index', [
        'users' => $users,
    ]);
});
```

La vista de Blade podría verse así:

```html
<html>
<head>
    <title>Cursor Paginate</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
 
<body>
    <div class="max-w-5xl mx-auto py-8">
        <h1 class="text-5xl">Cursor Paginate</h1>
 
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

Esto generaría una página similar a la siguiente:

![laravel-pagination](./img/laravel-pagination-3.avif)

Como podemos ver, dado que el método `cursorPaginate` no obtiene la cantidad total de registros en el conjunto de datos, el resultado de `$users->links()` es similar al que vimos al usar el método `simplePaginate`. Solo vemos los enlaces _"Previous"_ y _"Next"_ en los enlaces de paginación.

### Usando el `cursorPaginate` en Puntos Finales de API

Laravel también te permite usar el método `cursorPaginate` en los puntos finales de la API y convertirá automáticamente los datos paginados en JSON para nosotros.

Construyamos un punto final `/api/users` que devuelva los usuarios paginados en formato JSON:


```php
use App\Models\User;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    return User::query()->cursorPaginate();
});
```

Cuando llegamos a esta ruta, obtendremos una respuesta JSON similar a la siguiente (he limitado el campo `data` a solo 3 registros para abreviar):


```json
{
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
  "path": "http://example.com/users",
  "per_page": 15,
  "next_cursor": "eyJ1c2Vycy5pZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0",
  "next_page_url": "http://example.com/users?cursor=eyJ1c2Vycy5pZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0",
  "prev_cursor": null,
  "prev_page_url": null
}
```

Como podemos ver, la respuesta JSON es similar a las respuestas anteriores que hemos visto, pero con algunas pequeñas diferencias. Dado que no estamos obteniendo la cantidad total de registros, no tenemos los campos `last_page`, `last_page_url`, `links` o `total` en la respuesta. También puede haber notado que tampoco tenemos los campos `from` y `to`.

En su lugar, tenemos los campos `next_cursor` y `prev_cursor` que contienen el cursor para las páginas de datos anterior y siguiente. Dado que estamos en la primera página, los campos `prev_cursor` y `prev_page_url` son ambos `null`. Sin embargo, los campos `next_cursor` y `next_page_url` están establecidos.

El campo `next_cursor` es una cadena codificada en base 64 que contiene el cursor para la siguiente página de datos. Si decodificamos el campo `next_cursor`, obtendremos algo como esto (embellecido para facilitar su lectura):


```json
{
  "users.id": 15,
  "_pointsToNextItems": true
}
```

El cursor contiene dos piezas de información independientes:

- `users.id` - El ID del último registro obtenido en el conjunto de datos.
- `_pointsToNextItems` - Un valor booleano que nos indica si el cursor apunta al siguiente o al anterior conjunto de elementos. Si el valor es `true`, significa que el cursor debe usarse para obtener el siguiente conjunto de registros con un ID mayor que el valor `users.id`. Si el valor es `false`, significa que el cursor debe usarse para obtener el conjunto anterior de registros con un ID menor que el valor `users.id`.

Echemos un vistazo a cómo podría verse la segunda página de datos (nuevamente, acortada a 3 registros para abreviar):

```json
{
  "data": [
    {
      "id": 16,
      "name": "Durward Nikolaus",
      "email": "xkuhic@example.com",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 17,
      "name": "Dr. Glenda Cruickshank IV",
      "email": "kristoffer.schiller@example.org",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    },
    {
      "id": 18,
      "name": "Prof. Dolores Predovic",
      "email": "frankie.schultz@example.net",
      "email_verified_at": "2024-10-15T23:19:28.000000Z",
      "created_at": "2024-10-15T23:19:29.000000Z",
      "updated_at": "2024-10-15T23:19:29.000000Z"
    }
  ],
  "path": "http://example.com/users",
  "per_page": 15,
  "next_cursor": "eyJ1c2Vycy5pZCI6MzAsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0",
  "next_page_url": "http://example.com/users?cursor=eyJ1c2Vycy5pZCI6MzAsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0",
  "prev_cursor": "eyJ1c2Vycy5pZCI6MTYsIl9wb2ludHNUb05leHRJdGVtcyI6ZmFsc2V9",
  "prev_page_url": "http://example.com/users?cursor=eyJ1c2Vycy5pZCI6MTYsIl9wb2ludHNUb05leHRJdGVtcyI6ZmFsc2V9"
}
```

Podemos ver que los campos `prev_cursor` y `prev_page_url` ahora están configurados, y los campos `next_cursor` y `next_page_url` se han actualizado con el cursor para la siguiente página de datos.

### Las Consultas SQL Subyacentes

Para comprender mejor cómo funciona la paginación del cursor, echemos un vistazo a las consultas SQL subyacentes que se ejecutan cuando se utiliza el método `cursorPaginate`.

En la primera página de datos (que contiene 15 registros), se ejecutaría la siguiente consulta SQL:

```sql
select * from `users` order by `users`.`id` asc limit 16
```

Podemos ver que estamos recuperando los primeros 16 registros de la tabla `users` y ordenándolos por la columna `id` en orden ascendente. De manera similar al método `simplePaginate`, estamos recuperando 16 filas porque queremos determinar si hay más registros para recuperar.

Imaginemos que luego navegamos a la siguiente página de elementos con el siguiente cursor:


```sh
eyJ1c2Vycy5pZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

Cuando se decodifica este cursor, obtenemos el siguiente objeto JSON:


```json
{
  "users.id": 15,
  "_pointsToNextItems": true
}
```

Luego, Laravel ejecutará la siguiente consulta SQL para obtener el siguiente conjunto de registros:


```sql
select * from `users` where (`users`.`id` > 15) order by `users`.`id` asc limit 16
```

Como podemos ver, estamos recuperando los siguientes 16 registros de la tabla `users` que tienen un `id` mayor que 15 (ya que 15 fue el último ID en la página anterior).

Ahora supongamos que el ID del primer usuario en la página 2 es 16. Cuando naveguemos de regreso a la primera página de datos desde la segunda página, se utilizará el siguiente cursor:

```sh
eyJ1c2Vycy5pZCI6MTYsIl9wb2ludHNUb05leHRJdGVtcyI6ZmFsc2V9
```

Cuando esto se decodifica, obtenemos el siguiente objeto JSON:


```json
{
  "users.id": 16,
  "_pointsToNextItems": false
}
```

Cuando pasamos a la siguiente página de resultados, el último registro obtenido se utiliza como cursor. Cuando volvemos a la página anterior de resultados, el primer registro obtenido se utiliza como cursor. Por este motivo, podemos ver que el valor `users.id` está establecido en 16 en el cursor. También podemos ver que el valor `_pointsToNextItems` está establecido en `false` porque estamos volviendo al conjunto anterior de elementos.

Como resultado, se ejecutaría la siguiente consulta SQL para obtener el conjunto anterior de registros:


```sql
select * from `users` where (`users`.`id` < 16) order by `users`.`id` desc limit 16
```

Como podemos ver, la restricción `where` ahora busca registros con un `id` menor que 16 (ya que 16 fue el primer ID en la página 2) y los resultados se ordenan en orden descendente.

## Usando Recursos API con Paginación

Hasta ahora, en nuestros ejemplos de API, solo hemos devuelto los datos paginados directamente desde el controlador. Sin embargo, en una aplicación del mundo real, es probable que desee procesar los datos antes de devolvérselos al usuario. Esto podría ser cualquier cosa, desde agregar o eliminar campos, convertir tipos de datos o incluso transformar los datos a un formato completamente diferente. Por este motivo, es probable que desee utilizar [Recursos de API](https://laravel.com/docs/11.x/eloquent-resources), ya que le brindan una forma de transformar sus datos de manera consistente antes de devolverlos.

Laravel te permite usar recursos API junto con la paginación. Veamos un ejemplo de cómo hacerlo.

Imagina que hemos creado una clase de recurso API `App\Http\Resources\UserResource` que transforma los datos del usuario antes de devolverlos. Podría verse así:


```php
declare(strict_types=1);
 
namespace App\Http\Resources;
 
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
 
final class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}
```

En el método `toArray`, definimos que siempre que procesamos un usuario a través de este recurso, solo queremos devolver los campos `id`, `name` y `email`.

Ahora construyamos un punto final de API `/api/users` simple en nuestro archivo `routes/api.php` que devuelva los usuarios paginados usando `App\Http\Resources\UserResource`:


```php
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Route;
 
Route::get('users', function () {
    $users = User::query()->paginate();
 
    return UserResource::collection(resource: $users);
});
```

En el código anterior, estamos recuperando una sola página de usuarios (supongamos que es la primera página que contiene 15 usuarios) de la base de datos. Luego, pasamos el campo `$users` (que será una instancia de `Illuminate\Pagination\LengthAwarePaginator)` al método `UserResource::collection`. Este método transformará los datos paginados utilizando `App\Http\Resources\UserResource` antes de devolverlos al usuario.

Cuando llegamos al punto final `/api/users`, obtendremos una respuesta JSON similar a la siguiente (he limitado el campo `data` a solo 3 registros para abreviar):


```json
{
  "data": [
    {
      "id": 1,
      "name": "Andy Runolfsson",
      "email": "teresa.wiegand@example.net"
    },
    {
      "id": 2,
      "name": "Rafael Cummings",
      "email": "odessa54@example.org"
    },
    {
      "id": 3,
      "name": "Reynold Lindgren",
      "email": "juwan.johns@example.net"
    }
  ],
  "links": {
    "first": "http://example.com/users?page=1",
    "last": "http://example.com/users?page=4",
    "prev": null,
    "next": "http://example.com/users?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
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
        "url": "http://example.com/users?page=2",
        "label": "Next &raquo;",
        "active": false
      }
    ],
    "path": "http://example.com/users",
    "per_page": 15,
    "to": 15,
    "total": 50
  }
}
```


Como podemos ver en el JSON anterior, Laravel detecta que estamos trabajando con un conjunto de datos paginados y devuelve los datos paginados en un formato similar al anterior. Sin embargo, esta vez los usuarios en el campo `data` solo contienen los campos `id`, `name` y `email` que especificamos en nuestra clase de recurso API. Otros campos (`current_page`, `from`, `last_page`, `links`, `path`, `per_page`, `to` y `total`) aún se devuelven como parte de los datos paginados, pero se han colocado dentro de un campo `meta`. También hay un campo `links` que contiene los enlaces `first`, `last`, `prev` y `next` a las diferentes páginas de datos.

## Changing the Per Page Value


