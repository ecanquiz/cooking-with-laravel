# La Guía Definitiva para la Validación de Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/laravel-validation)
:::

![laravel-validation](./img/laravel-validation.avif)

La validación es una parte importante de cualquier aplicación web. Puede ayudar a prevenir vulnerabilidades de seguridad, corrupción de datos y una gran cantidad de otros problemas que pueden surgir cuando se trabaja con la entrada del usuario.

En este artículo, veremos qué es la validación y por qué es importante. Luego, compararemos la validación del lado del cliente con la del lado del servidor y exploraremos por qué nunca debería confiar únicamente en la validación del lado del cliente en sus aplicaciones.

Luego, veremos algunas reglas de validación útiles que me gusta usar en mis aplicaciones de Laravel. Finalmente, veremos cómo puede crear su propia regla de validación y probarla para asegurarse de que funcione como se espera.

## ¿Qué es la Validación?

La validación es el proceso de comprobar que los datos son válidos antes de intentar usarlos. Esto puede ser cualquier cosa, desde comprobar cosas simples como si un campo obligatorio está presente en una solicitud, hasta comprobaciones más complejas como si un campo coincide con un patrón determinado o es único en una base de datos.

Normalmente, al validar datos en una aplicación web, si los datos no son válidos, querrá devolver un mensaje de error al usuario.

Esto puede ayudar a prevenir vulnerabilidades de seguridad, corrupción de datos y mejorar la precisión de los datos. Por lo tanto, solo continuamos con el procesamiento de la solicitud si los datos son válidos.

Recuerde, no se puede confiar en ningún dato de un usuario (al menos hasta que lo haya validado).


## ¿Por qué es Importante la Validación?

La validación es importante por varios motivos, entre ellos:

### Mejora de la Seguridad

Una de las razones más importantes para validar los datos de su aplicación es mejorar la seguridad. Al validar los datos antes de usarlos, puede reducir las posibilidades de que se utilicen datos maliciosos para atacar su aplicación o a sus usuarios.

### Prevención del Almacenamiento de Datos Incorrectos

Imagina un escenario en el que esperamos que un campo sea un número entero, pero el usuario pasa un archivo en su lugar. Esto podría causar todo tipo de problemas en nuestra aplicación cuando intentemos usar esos datos en otra parte de nuestra aplicación.

Como otro ejemplo, imagina que estás creando una aplicación web que permite a los usuarios votar en encuestas. Las encuestas solo se pueden votar entre un tiempo `opens_at` y un tiempo `closes_at` que se especifica en un modelo `App\Models\Poll`. ¿Qué sucedería si alguien que configura la encuesta establece accidentalmente el tiempo `closes_at` antes del tiempo `opens_at`? Según cómo gestiones esto en tu aplicación, esto podría causar todo tipo de problemas.

Al validar los datos antes de que se almacenen en el modelo, podemos mejorar la precisión de los datos en nuestra aplicación y reducir las posibilidades de que se almacenen datos incorrectos.

### Garantizar la Correcta Entrada de Comandos Artisan

Además de poder validar los datos que se pasan en las solicitudes HTTP, también puedes validar los comandos de Artisan. Esto puede ayudar a evitar que un desarrollador ingrese accidentalmente un valor no válido y provoque problemas en tu aplicación.


## Validación del Lado del Cliente vs Validación del Lado del Servidor

En general, existen dos tipos de validación que puede utilizar en sus aplicaciones: validación del lado del cliente y validación del lado del servidor.

### Validación del Lado del Cliente

La validación del lado del cliente es una validación que se realiza en el navegador antes de que los datos se envíen al servidor. Puede implementarse mediante JavaScript o incluso mediante atributos HTML.

Por ejemplo, podemos agregar una validación simple a un campo numérico en HTML para asegurarnos de que el usuario ingrese un número entre 1 y 10:


```html
<input type="number" name="quantity" min="1" max="10" required>
```

Este campo de entrada consta de cuatro partes independientes que son útiles para fines de validación del lado del cliente:

- `type="number"`: Esto le indica al navegador que la entrada debe ser un número. En la mayoría de los navegadores, esto evitará que el usuario ingrese algo que no sea un número. En un dispositivo móvil, incluso puede aparecer un teclado numérico en lugar de un teclado normal, lo cual es excelente para la experiencia del usuario.
- `min="1"`: Esto le indica al navegador que el número ingresado debe ser al menos 1.
- `max="10"`: Esto le indica al navegador que el número ingresado debe ser como máximo 10.
- `required`: Esto le indica al navegador que el campo es obligatorio y debe completarse antes de poder enviar el formulario.


En la mayoría de los navegadores, si el usuario intenta enviar el formulario con un valor no válido (o sin ningún valor), el navegador evitará que se envíe el formulario y mostrará un mensaje de error o una pista al usuario.

Esto es excelente para guiar al usuario y mejorar la experiencia general del usuario de su aplicación. Pero eso es todo lo que debe tratarse: una guía. Nunca debe confiar en la validación del lado del cliente como la única forma de validación en su aplicación.

Si alguien abriera las herramientas de desarrollador en su navegador, podría eliminar y omitir fácilmente la validación del lado del cliente que tiene implementada.

Además de esto, es importante recordar que cuando los usuarios malintencionados intentan atacar su aplicación, generalmente usarán scripts automatizados para enviar solicitudes directamente a su servidor. Esto significa que se omitirá la validación del lado del cliente que tiene implementada.


### Validación del Lado del Servidor

La validación del lado del servidor es la validación que ejecuta en el backend de su aplicación en su servidor. En el contexto de las aplicaciones Laravel, esta es típicamente la validación que ejecuta en sus controladores o clases de solicitud de formulario.

Dado que la validación se encuentra en su servidor y el usuario no puede cambiarla, es la única forma de garantizar realmente que los datos que se envían a su servidor sean válidos.

Por lo tanto, es importante tener siempre la validación del lado del servidor en su lugar en sus aplicaciones. En un mundo ideal, cada campo que intente leer de una solicitud debe validarse antes de intentar usarlo para realizar cualquier lógica comercial.


## Cómo Maneja Laravel la Validación

Ahora que entendemos qué es la validación y por qué es importante, veamos cómo usarla en Laravel.

Si has estado trabajando con Laravel por un tiempo, sabrás que Laravel tiene un sistema de validación increíble integrado en el marco. Por lo tanto, es realmente fácil comenzar con la validación en tus aplicaciones.

Hay varias formas comunes de validar datos en Laravel, pero veremos las dos formas más comunes:

- Validar datos manualmente
- Validar datos usando clases de solicitud de formulario


### Validar Datos Manualmente

Para validar datos manualmente (como en un método de controlador), puede utilizar la fachada `Illuminate\Support\Facades\Validator` y llamar al método `make`.

Luego podemos pasar dos parámetros al método `make`:


- `data`: los datos que queremos validar
- `rules`: las reglas con las que queremos validar los datos

Nota al margen: el método `make` también acepta dos parámetros opcionales: `messages` y `attributes`. Estos se pueden utilizar para personalizar los mensajes de error que se devuelven al usuario, pero no los cubriremos en este artículo.

Veamos un ejemplo de cómo podría querer validar dos campos:


```php
use Illuminate\Support\Facades\Validator;
 
$validator = Validator::make(
    data: [
        'title' => 'Blog Post',
        'description' => 'Blog post description',
    ],
    rules: [
        'title' => ['required', 'string', 'max:100'],
        'description' => ['required', 'string', 'max:250'],
    ]
);
```


En el ejemplo anterior, podemos ver que estamos validando dos campos: `title` y `body`. Hemos codificado los valores de los dos campos para que los ejemplos sean más claros, pero en un proyecto de la vida real, normalmente se obtendrían estos campos de la solicitud. Estamos comprobando que el campo `title` esté configurado, sea una cadena y tenga una longitud máxima de 100 caracteres. También estamos comprobando que el campo `description` esté configurado, sea una cadena y tenga una longitud máxima de 250 caracteres.

Después de crear el validador, podemos llamar a los métodos en la instancia `Illuminate\Validation\Validator` que se devuelve. Por ejemplo, para comprobar si la validación ha fallado, podemos llamar al método `fails`:


```php
$validator = Validator::make(
    data: [
        'title' => 'Blog Post',
        'description' => 'Blog post description',
    ],
    rules: [
        'title' => ['required', 'string', 'max:100'],
        'description' => ['required', 'string', 'max:250'],
    ]
);
 
if ($validator->fails()) {
    // One or more of the fields failed validation.
    // Handle it here...
}
```


De manera similar, también podemos llamar al método `validate` en la instancia del validador:


```php
Validator::make(
    data: [
        'title' => 'Blog Post',
        'description' => 'Blog post description',
    ],
    rules: [
        'title' => ['required', 'string', 'max:100'],
        'description' => ['required', 'string', 'max:250'],
    ]
)->validate();
```

Este método `validate` arrojará `Illuminate\Validation\ValidationException` si la validación falla. Laravel manejará automáticamente esta excepción dependiendo del tipo de solicitud que se esté realizando (asumiendo que no haya cambiado el manejo de excepciones predeterminado en su aplicación). Si la solicitud es una solicitud web, Laravel redireccionará al usuario a la página anterior con los errores en la sesión para que los muestre. Si la solicitud es una solicitud API, Laravel devolverá una respuesta `422 Unprocessable Entity` con una representación JSON de los errores de validación como la siguiente:


```sh
{
  "message": "The title field is required. (and 1 more error)",
  "errors": {
    "title": [
      "The title field is required."
    ],
    "description": [
      "The description field is required."
    ]
  }
}
```


### Validando Datos Usando Clases de Solicitud de Formulario



La otra forma en la que normalmente validarás datos en tus aplicaciones de Laravel es mediante el uso de [clases de solicitud de formulario](https://laravel-news.com/form-requests). Las clases de solicitud de formulario son clases que extienden `Illuminate\Foundation\Http\FormRequest` y se utilizan para ejecutar comprobaciones de autorización y validación en solicitudes entrantes.

Creo que son una excelente manera de mantener limpios los métodos de tu controlador porque Laravel ejecutará automáticamente la validación contra los datos pasados ​​en la solicitud antes de que se ejecute el código de nuestro método de controlador. Por lo tanto, no necesitamos recordar ejecutar ningún método en la instancia del validador nosotros mismos.

Echemos un vistazo a un ejemplo simple. Imaginemos que tenemos un controlador `App\Http\Controllers\UserController` básico con un método `store` que nos permite crear un nuevo usuario:


```php
declare(strict_types=1);
 
namespace App\Http\Controllers;
 
use App\Http\Requests\Users\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
 
final class UserController extends Controller
{
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);
 
        return redirect()
            ->route('users.index')
            ->with('success', 'User created successfully.');
    }
}
```

En el método del controlador, podemos ver que estamos aceptando una clase de solicitud de formulario `App\Http\Requests\Users\StoreUserRequest` (que veremos a continuación) como parámetro de método. Esto le indicará a Laravel que queremos que la validación en esta clase de solicitud se ejecute automáticamente al llamar a este método a través de una solicitud HTTP.

Luego, estamos usando el método `validated` en la instancia de solicitud dentro de nuestro método del controlador para obtener los datos validados de la solicitud. Esto significa que solo devolverá los datos que se han validado. Por ejemplo, si intentáramos guardar un nuevo campo `profile_picture` en el controlador, también tendría que agregarse a la clase de solicitud de formulario. De lo contrario, no lo devolvería el método `validated` y, por lo tanto, `$request->validated('profile_picture')` devolvería `null`.

Ahora echemos un vistazo a la clase de solicitud del formulario `App\Http\Requests\Users\StoreUserRequest`:


```php
declare(strict_types=1);
 
namespace App\Http\Requests\Users;
 
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
 
final class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }
 
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users')],
            'password' => [Password::defaults()],
        ];
    }
}
```

Podemos ver que la clase de solicitud contiene dos métodos:

- `authorize`: este método se utiliza para determinar si el usuario está autorizado a realizar la solicitud. Si el método devuelve `false`, se devolverá una respuesta `403 Forbidden` al usuario. Si el método devuelve `true`, se ejecutarán las reglas de validación.
- `rules`: este método se utiliza para definir las reglas de validación que se deben ejecutar en la solicitud. El método debe devolver una matriz de reglas que se deben ejecutar en la solicitud.

En el método `rules`, estamos especificando que el campo `name` debe estar establecido, debe ser una cadena y debe tener una longitud máxima de 100 caracteres. También estamos especificando que el campo `email` debe estar establecido, debe ser un correo electrónico y debe ser único en la tabla `users` (en la columna `email`). Por último, especificamos que el campo `password` debe estar establecido y debe pasar las reglas de validación de contraseña predeterminadas que hemos configurado (veremos la validación de contraseña más adelante).

Como puede ver, esta es una excelente manera de separar la lógica de validación de la lógica del controlador, y creo que hace que el código sea más fácil de leer y mantener.

## Reglas de Validación Útiles en Laravel

Como ya he mencionado, el sistema de validación de Laravel es realmente potente y hace que agregar validación a tus aplicaciones sea muy fácil.

En esta sección, vamos a echar un vistazo rápido a algunas reglas de validación útiles que me gustan y creo que la mayoría de ustedes encontrarán útiles en sus aplicaciones.

Si estás interesado en consultar todas las reglas que están disponibles en Laravel, puedes encontrarlas en la documentación de Laravel: https://laravel.com/docs/11.x/validation


### Validación de Matrices

Un tipo común de validación que necesitarás ejecutar será la validación de matrices.

Esto podría ser cualquier cosa, desde validar que una serie de IDs pasados son todos válidos, hasta validar que una matriz de objetos pasados en una solicitud tienen ciertos campos.

Veamos un ejemplo de cómo validar una matriz y luego analizaremos lo que se está haciendo:



```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
 
Validator::make(
    data: [
        'users' => [
            [
                'name' => 'Eric Barnes',
                'email' => 'eric@example.com',
            ],
            [
                'name' => 'Paul Redmond',
                'email' => 'paul@example.com',
            ],
            [
                'name' => 'Ash Allen',
                'email' => 'ash@example.com',
            ],
        ],
    ],
    rules: [
        'users' => ['required', 'array'],
        'users.*' => ['required', 'array:name,email'],
        'users.*.name' => ['required', 'string', 'max:100'],
        'users.*.email' => ['required', 'email', 'unique:users,email'],
    ]
);
```

En el ejemplo anterior, pasamos una matriz de objetos, cada uno con un campo `name` y `email`.

Para la validación, primero definimos que el campo `users` está configurado y es una matriz. Luego, especificamos que cada elemento de la matriz (al que se apunta mediante `users.*`) es una matriz que contiene los campos `name` y `email`.

Luego, especificamos que el campo `name` (al que se apunta mediante `users.*.name`) debe estar configurado, debe ser una cadena y no puede tener más de 100 caracteres. También especificamos que el campo `email` (al que se apunta mediante `users.*.email`) debe estar configurado, debe ser un correo electrónico y debe ser único en la tabla `users` en la columna `email`.

Al poder usar el comodín `*` en las reglas de validación, podemos validar fácilmente matrices de datos en nuestras aplicaciones.


### Validación de Fechas

Laravel ofrece varias reglas de validación de fechas útiles que puedes usar. En primer lugar, para validar que un campo es una fecha válida, puedes usar la regla `date`:


```php
$validator = Validator::make(
    data: [
        'opens_at' => '2024-04-25',
    ],
    rules: [
        'opens_at' => ['required', 'date'],
    ]
);
```

Si prefieres comprobar que una fecha tiene un formato específico, puedes usar la regla `date_format`:



```php
$validator = Validator::make(
    data: [
        'opens_at' => '2024-04-25',
    ],
    rules: [
        'opens_at' => ['required', 'date_format:Y-m-d'],
    ]
);
```

Es probable que quieras comprobar si una fecha es anterior o posterior a otra fecha. Por ejemplo, supongamos que tienes los campos `opens_at` y `closes_at` en tu solicitud y quieres asegurarte de que `closes_at` sea posterior a `opens_at` y que `opens_at` sea posterior o igual a hoy. Puedes usar la regla `after` de la siguiente manera:


```php
$validator = Validator::make(
    data: [
        'opens_at' => '2024-04-25',
        'closes_at' => '2024-04-26',
    ],
    rules: [
        'opens_at' => ['required', 'date', 'after:today'],
        'closes_at' => ['required', 'date', 'after_or_equal:opens_at'],
    ]
);
```


En el ejemplo anterior, podemos ver que hemos pasado `today` como argumento a la regla `after` para el campo `opens_at`. Laravel intentará convertir esta cadena en un objeto `DateTime` válido utilizando la función `strtotime` y la comparará con ese.

Para el campo `closes_at`, hemos pasado `opens_at` como argumento a la regla `after_or_equal`. Laravel detectará automáticamente que este es otro campo que se está validando y comparará los dos campos entre sí.

De manera similar, Laravel también proporciona reglas `before` y `before_or_equal` que puedes usar para verificar que una fecha sea anterior a otra fecha:


```php
$validator = Validator::make(
    data: [
        'opens_at' => '2024-04-25',
        'closes_at' => '2024-04-26',
    ],
    rules: [
        'opens_at' => ['required', 'date', 'before:closes_at'],
        'closes_at' => ['required', 'date', 'before_or_equal:2024-04-27'],
    ]
);
```


### Validación de Contraseñas

Como desarrolladores web, nuestro trabajo es intentar ayudar a nuestros usuarios a mantenerse seguros en línea. Una forma de hacerlo es intentar promover buenas prácticas de contraseñas en nuestras aplicaciones, como exigir que una contraseña tenga una cierta longitud, contenga ciertos caracteres, etc.

Laravel nos facilita hacer esto al proporcionar una clase `Illuminate\Validation\Rules\Password` que podemos usar para validar contraseñas.

Viene con varios métodos que podemos encadenar para crear las reglas de validación de contraseñas que queremos. Por ejemplo, digamos que queremos que las contraseñas de nuestros usuarios se ajusten a los siguientes criterios:

- Tener al menos 8 caracteres
- Contener al menos una letra
- Contener al menos una letra mayúscula y una minúscula
- Contener al menos un número
- Contener al menos un símbolo
- No ser una contraseña comprometida (es decir, no estar en la base de datos _Have I Been Pwned_ que tiene registros de contraseñas expuestas por violaciones de datos en otros sistemas)

Nuestra validación podría verse así:


```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
 
$validator = Validator::make(
    data: [
        'password' => 'my-password-here'
        'password_confirmation' => 'my-password-here',
    ],
    rules: [
        'password' => [
            'required',
            'confirmed',
            Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(),
        ],
    ],
);
```


Como podemos ver en el ejemplo, estamos usando los métodos encadenables para crear las reglas de validación de contraseñas que queremos. Pero, ¿qué sucede si estamos usando estas reglas en varios lugares diferentes (por ejemplo, al registrarse, restablecer una contraseña, actualizar una contraseña en la página de su cuenta, etc.) y necesitamos cambiar esta validación para aplicar un mínimo de 12 caracteres? Necesitaríamos revisar todos los lugares donde se usan estas reglas y actualizarlas.

Para que esto sea más fácil, Laravel nos permite definir un conjunto predeterminado de reglas de validación de contraseñas que podemos usar en toda nuestra aplicación. Podemos hacer esto definiendo un conjunto predeterminado de reglas en el método `boot` de nuestro `App\Providers\AppServiceProvider` de la siguiente manera, usando el método `Password::defaults()`:


```php
namespace App\Providers;
 
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
 
class AppServiceProvider extends ServiceProvider
{
    // ...
 
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(static function (): Password {
            return Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised();
        });
    }
}
```


Después de hacer esto, ahora podemos llamar a `Password::defaults()` en nuestras reglas de validación y se utilizarán las reglas que hemos especificado en `AppServiceProvider`:



```php
'password' => ['required', 'confirmed', Password::defaults()],
```

### Validación de Colores

Casi todos los proyectos en los que he trabajado tenían algún tipo de selector de color. Ya sea para que un usuario elija un color para su perfil, un color de fondo para una sección de una página o cualquier otra cosa, es algo que surge con mucha frecuencia.

En el pasado, tuve que usar expresiones regulares (que admito que no entendía demasiado) para validar que el color fuera un color válido en formato hexadecimal (por ejemplo, `#FF00FF`). Sin embargo, Laravel ahora tiene un `hex_color` muy útil que puedes usar en su lugar:


```php
use Illuminate\Support\Facades\Validator;
 
Validator::make(
    data: [
        'color' => '#FF00FF',
    ],
    rules: [
        'color' => ['required', 'hex_color'],
    ]
);
```


### Validación de Archivos

Si estás cargando archivos a tu aplicación a través de tu servidor, querrás validar que el archivo sea válido antes de intentar almacenarlo. Como te imaginarás, Laravel ofrece varias reglas de validación de archivos que puedes usar.

Supongamos que quieres permitir que un usuario cargue un archivo PDF (.pdf) o Microsoft Word (.docx). La validación podría verse así:


```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
 
Validator::validate($request->all(), [
    'document' => [
        'required',
        File::types(['pdf', 'docx'])
            ->min('1kb')
            ->max('10mb'),
    ],
]);
```


En el ejemplo de código, podemos ver que estamos validando el tipo de archivo y también estableciendo algunos límites de tamaño de archivo mínimo y máximo. Estamos usando el método `types` para especificar los tipos de archivo que queremos permitir.

Los métodos `min` y `max` también pueden aceptar una cadena con otros sufijos que indiquen las unidades de tamaño de archivo. Por ejemplo, también podríamos usar:

- `10kb`
- `10mb`
- `10gb`
- `10tb`

Además, también tenemos la capacidad de garantizar que el archivo sea una imagen utilizando el método `image` en la clase `Illuminate\Validation\Rules\File`:


```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;
 
Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min('1kb')
            ->max('10mb')
            ->dimensions(Rule::dimensions()->maxWidth(500)->maxHeight(500)),
    ],
]);
```

En el ejemplo anterior, estamos validando que el archivo sea una imagen, estableciendo algunos límites de tamaño de archivo mínimos y máximos, y también estableciendo algunas dimensiones máximas (500 x 500 px).

Es posible que desee adoptar un enfoque diferente para las cargas de archivos en su aplicación. Por ejemplo, es posible que desee cargar directamente desde el navegador del usuario al almacenamiento en la nube (como S3). Si prefiere hacer esto, puede consultar el artículo [Cargar Archivos en Laravel con FilePond](https://laravel-news.com/laravel-filepond) que le muestra cómo hacerlo, el enfoque diferente para la validación que puede adoptar y cómo probarlo.


### Validar que un Campo Existe en la Base de Datos

Otra comprobación habitual que puede realizar es asegurarse de que exista un valor en la base de datos.

Por ejemplo, imaginemos que tiene algunos usuarios en su aplicación y ha creado una ruta para poder asignarlos en masa a un equipo. Por lo tanto, en su solicitud, es posible que desee validar que los `user_ids` que se pasan en la solicitud existan todos en la tabla `users`.

Para ello, puede utilizar la regla `exists` y pasar el nombre de la tabla en la que desea comprobar que existe el valor:



```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
 
Validator::make(
    data: [
        'users_ids' => [
            111,
            222,
            333,
        ],
    ],
    rules: [
        'user_ids' => ['required', 'array'],
        'user_ids.*' => ['required', 'exists:users,id'],
    ]
);
```

En el ejemplo anterior, estamos comprobando que cada uno de los IDs pasados ​​en la matriz `user_ids` exista en la tabla `users` en la columna `id`.

Esta es una excelente manera de garantizar que los datos con los que está trabajando sean válidos y existan en la base de datos antes de intentar usarlos.

Si desea llevar esto un paso más allá, puede aplicar una cláusula `where` a la regla `exists` para filtrar aún más la consulta que se ejecuta:


```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
 
Validator::make(
    data: [
        'users_ids' => [
            111,
            222,
            333,
        ],
    ],
    rules: [
        'user_ids' => ['required', 'array'],
        'user_ids.*' => ['required', Rule::exists('users')->where(static function (Builder $query): void {
            $query->where('is_verified', true);
        })],
    ]
);
```

En el ejemplo anterior, estamos comprobando que cada uno de los IDs pasados ​​en la matriz `user_ids` exista en la tabla `users` en la columna `id` y que la columna `is_verified` de los usuarios esté configurada en `true`. Por lo tanto, si pasamos el ID de un usuario que no está verificado, la validación fallaría.

### Validar que un Campo sea Único en la Base de Datos

De manera similar a la regla `exists`, Laravel también proporciona una regla `unique` que puedes usar para verificar que un valor sea único en la base de datos.

Por ejemplo, digamos que tienes una tabla `users` y quieres asegurarte de que el campo `email` sea único. Puedes usar la regla `unique` de la siguiente manera:


```php
use Illuminate\Support\Facades\Validator;
 
Validator::make(
    data: [
        'email' => 'mail@ashallendesign.co.uk',
    ],
    rules: [
        'email' => ['required', 'email', 'unique:users,email'],
    ]
```


En el ejemplo anterior, estamos comprobando que el campo `email` esté establecido, sea un correo electrónico y sea único en la tabla `users` en la columna `email`.

Pero, ¿qué sucedería si intentáramos utilizar esta validación en una página de perfil donde un usuario pudiera actualizar su dirección de correo electrónico? La validación fallaría porque existe una fila en la tabla `users` con la dirección de correo electrónico a la que el usuario está intentando actualizar. En este escenario, podemos utilizar el método ignore para `ignorar` el ID del usuario al comprobar la unicidad:


```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
 
Validator::make(
    data: [
        'email' => 'mail@ashallendesign.co.uk',
    ],
    rules: [
        'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
    ]
```

Si decide utilizar el método `ignore`, asegúrese de leer esta advertencia de la documentación de Laravel:

_"Nunca debe pasar ninguna entrada de solicitud controlada por el usuario al método `ignore`. En su lugar, solo debe pasar un ID único generado por el sistema, como un ID de incremento automático o UUID de una instancia del modelo Eloquent. De lo contrario, su aplicación será vulnerable a un ataque de inyección SQL"._

También puede haber ocasiones en las que desee agregar cláusulas `where` adicionales a la regla `unique`. Es posible que desee hacer esto para asegurarse de que una dirección de correo electrónico sea única para un equipo específico (lo que significa que otro usuario en un equipo diferente puede tener el mismo correo electrónico). Puede hacer esto pasando un cierre al método `where`:


```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
 
Validator::make(
    data: [
        'email' => 'mail@ashallendesign.co.uk',
    ],
    rules: [
        'email' => [
            'required',
            'email',
            Rule::unique('users')
                ->ignore($user->id)
                ->where(fn (Builder $query) => $query->where('team_id', $teamId));
        )],
    ],
);
```

## Creando Su Propia Regla de Validación

Aunque Laravel viene con una gran cantidad de reglas de validación integradas, es probable que haya ocasiones en las que necesites crear tu propia regla de validación personalizada para que se ajuste a un caso de uso específico.

¡Afortunadamente, esto también es muy fácil de hacer en Laravel!

Echemos un vistazo a cómo podemos crear nuestra regla de validación personalizada, cómo usarla y luego cómo escribir pruebas para ella.

Para los fines de este artículo, no nos importa demasiado lo que estamos validando. Solo queremos ver la estructura general de la creación de una regla de validación personalizada y cómo probarla. Por lo tanto, crearemos una regla simple que verifique si una cadena es un palíndromo.

En caso de que no lo sepas, un palíndromo es una palabra, frase, número u otra secuencia de caracteres que se lee igual hacia adelante y hacia atrás. Por ejemplo, "racecar" es un palíndromo porque si invirtieras la cadena, seguiría siendo "racecar". Considerando que "laravel" no es un palíndromo porque si invirtieras la cadena, sería "levaral".

Para comenzar, primero crearemos una nueva regla de validación ejecutando el siguiente comando en nuestra ruta de proyecto:


```sh
php artisan make:rule Palindrome
```

Esto debería haber creado un nuevo archivo `App/Rules/Palindrome.php` para nosotros:


```php
namespace App\Rules;
 
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
 
class Palindrome implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        //
    }
}
```

Laravel llamará automáticamente al método `validate` cuando se ejecute la regla. El método toma tres parámetros:

- `$attribute`: El nombre del atributo que se está validando.
- `$value`: El valor del atributo que se está validando.
- `$fail`: Un cierre que puedes llamar si la validación falla.

De modo que podemos agregar nuestra lógica de validación dentro del método `validate` de la siguiente manera:


```php
declare(strict_types=1);
 
namespace App\Rules;
 
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;
 
final readonly class Palindrome implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param Closure(string): PotentiallyTranslatedString $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value !== strrev($value)) {
            $fail('The :attribute must be a palindrome.');
        }
    }
}
```

En la regla anterior, simplemente verificamos si el valor pasado a la regla es el mismo que el valor invertido. Si no lo es, llamamos al cierre `$fail` con un mensaje de error. Esto hará que la validación del campo falle. Si la validación es correcta, la regla no hará nada y podremos continuar con nuestra aplicación.

Ahora que hemos creado nuestra regla, podemos usarla en nuestra aplicación de la siguiente manera:



```php
use App\Rules\Palindrome;
use Illuminate\Support\Facades\Validator;
 
$validator = Validator::make(
    data: [
        'word' => 'racecar',
    ],
    rules: [
        'word' => [new Palindrome()],
    ]
);
```

Aunque esta es una regla simple que hemos creado con fines de demostración, esperamos que esto le dé una idea de cómo podría crear reglas más complejas para sus aplicaciones.


## Prueba de Su Propia Regla de Validación

Al igual que cualquier otro código de su aplicación, es importante probar sus reglas de validación para asegurarse de que funcionan como se espera. De lo contrario, puede correr el riesgo de utilizar una regla que no funciona como espera.

Para comprender cómo hacerlo, veamos cómo podemos probar la regla del palíndromo que creamos en la sección anterior.

Para esta regla en particular, hay dos escenarios que queremos probar:

- La regla se aprueba cuando el valor es un palíndromo.
- La regla falla cuando el valor no es un palíndromo.

En reglas más complejas, puede tener más escenarios, pero para los fines de este artículo, lo mantendremos simple.

Crearemos un nuevo archivo de prueba en nuestro directorio `tests/Unit/Rules` llamado `PalindromeTest.php`.

Echemos un vistazo al archivo de prueba y luego analizaremos lo que se está haciendo:


```php
declare(strict_types=1);
 
namespace Tests\Unit\Rules;
 
use App\Rules\PalindromeNew;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
 
final class PalindromeTest extends TestCase
{
    #[Test]
    #[DataProvider('validValues')]
    public function rule_passes_with_a_valid_value(string $word): void
    {
        (new PalindromeNew())->validate(
            attribute: 'word',
            value: $word,
            fail: fn () => $this->fail('The rule should pass.'),
        );
 
        // We got to this point without any exceptions, so the rule passed.
        $this->assertTrue(true);
    }
 
    #[Test]
    #[DataProvider('invalidValues')]
    public function rule_fails_with_an_invalid_value(string $word): void
    {
        (new PalindromeNew())->validate(
            attribute: 'word',
            value: $word,
            fail: fn () => $this->assertTrue(true),
        );
    }
 
    public static function validValues(): array
    {
        return [
            ['racecar'],
            ['radar'],
            ['level'],
            ['kayak'],
        ];
    }
 
    public static function invalidValues(): array
    {
        return [
            ['laravel'],
            ['eric'],
            ['paul'],
            ['ash'],
        ];
    }
}
```


En el archivo de prueba anterior, hemos definido dos pruebas: `rule_passes_with_a_valid_value` y `rule_fails_with_an_invalid_value`.

Como sugieren los nombres de las pruebas, la primera prueba garantiza que la regla se apruebe cuando el valor sea un palíndromo, y la segunda prueba garantiza que la regla falle cuando el valor no sea un palíndromo.

Estamos usando el atributo `PHPUnit\Framework\Attributes\DataProvider` para proporcionar a la prueba una lista de valores válidos e inválidos con los que realizar pruebas. Esta es una excelente manera de mantener limpias las pruebas y poder verificar varios valores con la misma prueba. Por ejemplo, si alguien agregara un nuevo valor válido al método `validValues`, la prueba se ejecutaría automáticamente con ese valor.

En la prueba `rule_passes_with_a_valid_value`, estamos llamando al método `validate` en la regla con un valor válido. Hemos pasado un cierre al parámetro `fail` (este es el parámetro que llamas si la validación falla dentro de la regla). Hemos especificado que si se ejecuta el cierre (es decir, la validación falla), entonces la prueba debería fallar. Si llegamos al final de la prueba sin que se ejecute el cierre, entonces sabemos que la regla pasó y podemos agregar una simple aserción `assertTrue(true)` para pasar la prueba.

En la prueba `rule_fails_with_an_invalid_value`, estamos haciendo lo mismo que la primera prueba, pero esta vez estamos pasando un valor no válido a la regla. Hemos especificado que si se ejecuta el cierre (es decir, la validación falla), entonces la prueba debería pasar porque estamos esperando que se llame al cierre. Si llegamos al final de la prueba sin que se ejecute el cierre, entonces no se habrán realizado aserciones y PHPUnit debería generar una advertencia para nosotros. Sin embargo, si prefieres ser más explícito y asegurarte de que la prueba falla en lugar de simplemente dar un error, es posible que desees adoptar un enfoque ligeramente diferente para escribir la prueba.



## Conclusión

En este artículo, hemos analizado qué es la validación y por qué es importante. Hemos comparado la validación del lado del cliente con la del lado del servidor y hemos explorado por qué la validación del lado del cliente nunca debería utilizarse como la única forma de validación en sus aplicaciones.

También hemos analizado algunas reglas de validación útiles que me gusta utilizar en mis aplicaciones de Laravel. Por último, hemos explorado cómo puede crear su propia regla de validación y probarla para asegurarse de que funcione como se espera.

Con suerte, ahora debería sentirse lo suficientemente seguro como para comenzar a utilizar más la validación para mejorar la seguridad y la confiabilidad de sus aplicaciones.
