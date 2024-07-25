# La guía definitiva para la validación de Laravel

https://laravel-news.com/laravel-validation
https://laravel-news.com/query-scopes
https://laravel-news.com/model-events
https://laravel-news.com/eloquent-factories-with-phpunit-data-providers
https://laravel-news.com/asserting-json-response-structure-in-laravel

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


### Validating Data Using Form Request Classes



