# Una Guía para los Eventos de Modelo de Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/model-events)
:::


![model-events](./img/model-events.avif)


Los eventos de modelo son una característica muy útil en Laravel que puede ayudarte a ejecutar lógica automáticamente cuando se realizan ciertas acciones en tus modelos Eloquent. Pero a veces pueden provocar efectos secundarios extraños si no se usan correctamente.

En este artículo, veremos qué son los eventos de modelo y cómo usarlos en tu aplicación Laravel. También veremos cómo probar tus eventos de modelo y algunos de los problemas que debes tener en cuenta al usarlos. Finalmente, veremos algunos enfoques alternativos a los eventos de modelo que quizás quieras considerar usar.

## ¿Qué son los Eventos y los Detectores?

Es posible que ya hayas oído hablar de los "eventos" y los "detectores". Pero si no es así, aquí tienes un breve resumen de lo que son:


### Eventos

Son cosas que suceden en tu aplicación y sobre las que quieres actuar, por ejemplo, un usuario que se registra en tu sitio, un usuario que inicia sesión, etc.

Normalmente, en Laravel, los eventos son clases PHP. Aparte de los eventos proporcionados por el framework o paquetes de terceros, normalmente se guardan en el directorio `app/Events`.

A continuación, se muestra un ejemplo de una clase de evento simple que podrías querer despachar cada vez que un usuario se registre en tu sitio:



```php
declare(strict_types=1);
 
namespace App\Events;
 
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
 
final class UserRegistered
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;
 
    public function __construct(public User $user)
    {
        //
    }
}
```


En el ejemplo básico anterior, tenemos una clase de evento `App\Events\UserRegistered` que acepta una instancia del modelo `User` en su constructor. Esta clase de evento es un contenedor de datos simple que contiene la instancia del usuario que se registró.

Cuando se despacha, el evento disparará cualquier detector que lo esté detectando.

A continuación, se muestra un ejemplo simple de cómo se puede endespachar ese evento cuando un usuario se registra:



```php
use App\Events\UserRegistered;
use App\Models\User;
 
$user = User::create([
    'name' => 'Eric Barnes',
    'email' => 'eric@example.com',
]);
 
UserRegistered::dispatch($user);
```


En el ejemplo anterior, creamos un nuevo usuario y luego despachamos el evento `App\Events\UserRegistered` con la instancia del usuario. Suponiendo que los detectores estén registrados correctamente, esto disparará cualquier detector que esté detectando el evento `App\Events\UserRegistered`.



### Detectores

Los detectores son bloques de código que quieres ejecutar cuando ocurre un evento específico.

Por ejemplo, siguiendo con nuestro ejemplo de registro de usuario, es posible que quieras enviar un correo electrónico de bienvenida al usuario cuando se registre. Podrías crear un detector que detecte el evento `App\Events\UserRegistered` y envíe el correo electrónico de bienvenida.

En Laravel, los detectores son típicamente (pero no siempre, lo cubriremos más adelante) clases que se encuentran en el directorio `app/Listeners`.

Un ejemplo de un detector que envía un correo electrónico de bienvenida a un usuario cuando se registra podría verse así:


```php
declare(strict_types=1);
 
namespace App\Listeners;
 
use App\Events\UserRegistered;
use App\Notifications\WelcomeNotification;
use Illuminate\Support\Facades\Mail;
 
final readonly class SendWelcomeEmail
{
    public function handle(UserRegistered $event): void
    {
        $event->user->notify(new WelcomeNotification());
    }
}
```


Como podemos ver en el ejemplo de código anterior, la clase detectora `App\Listeners\SendWelcomeEmail` tiene un método `handle` que acepta una instancia de evento `App\Events\UserRegistered`. Este método es responsable de enviar un correo electrónico de bienvenida al usuario.

Para obtener una explicación más detallada de los eventos y los detectores, es posible que desee consultar la documentación oficial: https://laravel.com/docs/11.x/events


## ¿Qué son los Eventos de Modelo?

En las aplicaciones de Laravel, normalmente necesitarás despachar eventos manualmente cuando ocurran determinadas acciones. Como vimos en nuestro ejemplo anterior, podemos usar el siguiente código para despachar un evento:


```php
UserRegistered::dispatch($user);
```

Sin embargo, cuando trabajamos con modelos Eloquent en Laravel, hay algunos eventos que se despachan automáticamente, por lo que no necesitamos despacharlos manualmente. Solo necesitamos definir detectores para ellos si queremos realizar una acción cuando ocurren.

La lista a continuación muestra los eventos que los modelos Eloquent despachan automáticamente junto con sus disparadores:


- **retrieved** - recuperado de la base de datos.
- **creating** - se está creando el modelo.
- **created** - modelo ha sido creado.
- **updating** - modelo se esta actualizando.
- **updated** - modelo ha sido actualizado.
- **saving** - modelo se está creando o actualizando.
- **saved** - modelo ha sido creado o actualizado.
- **deleting** - modelo está siendo eliminado.
- **deleted** - modelo ha sido eliminado.
- **trashed** - modelo ha sido eliminado suavemente.
- **forceDeleting** - modelo está siendo eliminado a la fuerza.
- **forceDeleted** - modelo ha sido eliminado a la fuerza
- **restoring** - modelo se está restaurando a partir de una eliminación suave.
- **restored** - modelo ha sido restaurado a partir de una eliminación suave.
- **replicating** - modelo está siendo replicado.


En la lista anterior, puede observar que algunos nombres de eventos son similares; por ejemplo, `creating` y `created`. Los eventos que terminan en `ing` se realizan antes de que ocurra la acción y los cambios se persisten en la base de datos. Mientras que los eventos que terminan en `ed` se realizan después de que ocurre la acción y los cambios se persisten en la base de datos.


Echemos un vistazo a cómo podemos utilizar estos eventos de modelo en nuestras aplicaciones Laravel.


## Detectar Eventos de Modelo Usando `dispatchesEvents`

Una forma de detectar eventos de modelo es definir una propiedad `dispatchesEvents` en su modelo.

Esta propiedad le permite mapear eventos de modelo de Eloquent a las clases de eventos que se deben despachar cuando ocurre el evento. Esto significa que puede definir sus detectores como lo haría con cualquier otro evento.

Para proporcionar más contexto, echemos un vistazo a un ejemplo.

Imaginemos que estamos creando una aplicación de blogs que tiene dos modelos: `App\Models\Post` y `App\Models\Author`. Supongamos que ambos modelos admiten eliminaciones suaves. Cuando guardamos una nueva `App\Models\Post`, queremos calcular el tiempo de lectura de la publicación en función de la longitud del contenido. Cuando eliminamos suavemente a un autor, queremos eliminar suavemente todas las publicaciones del autor.

### Configuración de los Modelos


Podríamos tener un modelo `App\Models\Author` que se vea así:



```php
declare(strict_types=1);
 
namespace App\Models;
 
use App\Events\AuthorDeleted;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
 
final class Author extends Model
{
    use HasFactory;
    use SoftDeletes;
 
    protected $dispatchesEvents = [
        'deleted' => AuthorDeleted::class,
    ];
 
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```


En el modelo anterior, tenemos:


- Se agregó una propiedad `dispatchesEvents` que asigna el evento de modelo `deleted` a la clase de evento `App\Events\AuthorDeleted`. Esto significa que cuando se elimina el modelo, se despachará un nuevo evento `App\Events\AuthorDeleted`. Crearemos esta clase de evento en unos momentos.
- Se definió una relación `posts`.
- Se habilitaron eliminaciones suaves en el modelo mediante el uso del atributo `Illuminate\Database\Eloquent\SoftDeletes`.

Ahora, creemos nuestro modelo `App\Models\Post`:


```php
declare(strict_types=1);
 
namespace App\Models;
 
use App\Events\PostSaving;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
 
final class Post extends Model
{
    use HasFactory;
    use SoftDeletes;
 
    protected $dispatchesEvents = [
        'saving' => PostSaving::class,
    ];
 
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

En el modelo `App\Models\Post` anterior, tenemos:

- Se agregó una propiedad `dispatchesEvents` que asigna el evento del modelo `saving` a la clase de evento `App\Events\PostSaving`. Esto significa que cuando se crea o se actualiza el modelo, se despachará un nuevo evento `App\Events\PostSaving`. Crearemos esta clase de evento en unos momentos.
- Se definió una relación `author`.
- Se habilitaron las eliminaciones suaves en el modelo mediante el rasgo `Illuminate\Database\Eloquent\SoftDeletes`.

Nuestros modelos ahora están preparados, así que creemos nuestras clases de evento `App\Events\AuthorDeleted` y `App\Events\PostSaving`.


### Creando las Clases de Eventos

Crearemos una clase de evento `App\Events\PostSaving` que se despachará cuando se guarde una nueva publicación:


```php
declare(strict_types=1);
 
namespace App\Events;
 
use App\Models\Post;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
 
final class PostSaving
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;
 
    public function __construct(public Post $post)
    {
        //
    }
}
```


En el código anterior, podemos ver la clase de evento `App\Events\PostSaving` que acepta una instancia de modelo `App\Models\Post` en su constructor. Esta clase de evento es un contenedor de datos simple que contiene la instancia de publicación que se está guardando.

De manera similar, podemos crear una clase de evento `App\Events\AuthorDeleted` que se despachará cuando se elimine un autor:


```php
declare(strict_types=1);
 
namespace App\Events;
 
use App\Models\Author;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
 
final class AuthorDeleted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;
 
   public function __construct(public Author $author)
   {
       //
   }
}
```


En la clase `App\Events\AuthorDeleted` anterior, podemos ver que el constructor acepta una instancia de modelo `App\Models\Author`.

Ahora podemos continuar con la creación de nuestros detectores.


### Creando los Detectores

Primero, creemos un detector que se pueda usar para calcular el tiempo de lectura estimado de una publicación.

Crearemos una nueva clase detectora `App\Listeners\CalculateReadTime`:


```php
declare(strict_types=1);
 
namespace App\Listeners;
 
use App\Events\PostSaving;
use Illuminate\Support\Str;
 
final readonly class CalculateReadTime
{
    public function handle(PostSaving $event): void
    {
        $event->post->read_time_in_seconds = (int) ceil(
            (Str::wordCount($event->post->content) / 265) * 60
        );
    }
}
```


Como podemos ver en el código anterior, tenemos un único método `handle`. Este es el método que se llamará automáticamente cuando se despache el evento `App\Events\PostSaving`. Acepta una instancia de la clase de evento `App\Events\PostSaving` que contiene la publicación que se está guardando.

En el método `handle`, estamos usando una fórmula ingenua para calcular el tiempo de lectura de la publicación. En este caso, estamos asumiendo que la velocidad de lectura promedio es de 265 palabras por minuto. Estamos calculando el tiempo de lectura en segundos y luego configurando el atributo `read_time_in_seconds` en el modelo de publicación.

Dado que este detector se llamará cuando se dispare el evento del modelo `saving`, esto significa que el atributo `read_time_in_seconds` se calculará cada vez que se cree o actualice una publicación antes de que se guarde en la base de datos.

También podemos crear un detector que elimine de forma suave todas las publicaciones relacionadas cuando se elimine de forma suave a un autor.

Podemos crear una nueva clase detectora `App\Listeners\SoftDeleteAuthorRelationships`:



```php
declare(strict_types=1);
 
namespace App\Listeners;
 
use App\Events\AuthorDeleted;
 
final readonly class SoftDeleteAuthorRelationships
{
    public function handle(AuthorDeleted $event): void
    {
        $event->author->posts()->delete();
 
        // Soft delete any other relationships here...
    }
}
```


En el detector anterior, el método `handle` acepta una instancia de la clase de evento `App\Events\AuthorDeleted`. Esta clase de evento contiene el autor que se está eliminando. Luego, eliminamos las publicaciones del autor mediante el método `delete` en la relación `posts`.

Como resultado, siempre que se elimine suavemente un modelo `App\Models\Author`, también se eliminarán suavemente todas las publicaciones del autor.

Como nota al margen, vale la pena señalar que probablemente desee utilizar una solución más sólida y reutilizable para lograr esto. Pero para los fines de este artículo, lo mantendremos simple.

## Detectar Eventos de Modelos Usando Clausura

Otro enfoque que puede utilizar es definir sus detectores como clausuras en el propio modelo.

Tomemos nuestro ejemplo anterior de eliminación suave de publicaciones cuando se elimina suavemente a un autor. Podemos actualizar nuestro modelo `App\Models\Author` para incluir una clausura que detecte el evento de modelo `deleted`:



```php
declare(strict_types=1);
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
 
final class Author extends Model
{
    use HasFactory;
    use SoftDeletes;
 
    protected static function booted(): void
    {
        self::deleted(static function (Author $author): void {
            $author->posts()->delete();
        });
    }
 
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```


Podemos ver en el modelo anterior que estamos definiendo nuestro detector dentro del método `booted` del modelo. Queremos detectar el evento del modelo `deleted`, por lo que hemos utilizado `self::deleted`. De manera similar, si quisiéramos crear un detector para el evento del modelo `created`, podríamos utilizar `self::created`, y así sucesivamente. El método `self::deleted` acepta una clausura que recibe el `App\Models\Author` que se está eliminando. Esta clausura se ejecutará cuando se elimine el modelo, por lo que se eliminarán todas las publicaciones del autor.

Me gusta bastante este enfoque para detectores muy simples. Mantiene la lógica dentro de la clase del modelo para que los desarrolladores puedan verla más fácilmente. A veces, extraer la lógica en una clase detectora independiente puede hacer que el código sea más difícil de seguir y rastrear, lo que puede dificultar el seguimiento del flujo de la lógica, especialmente si no está familiarizado con la base de código. Sin embargo, si el código dentro de estas clausuras se vuelve más complejo, puede que valga la pena extraer la lógica en una clase detectora independiente.

Un consejo útil que conviene saber es que también se puede utilizar la función `Illuminate\Events\queueable` para que la clausura se pueda poner en cola. Esto significa que el código del detector se colocará en la cola para ejecutarse en segundo plano en lugar de en el mismo ciclo de vida de la solicitud. Podemos actualizar nuestro detector para que se pueda poner en cola de la siguiente manera:


```php
declare(strict_types=1);
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use function Illuminate\Events\queueable;
 
final class Author extends Model
{
    // ...
 
    protected static function booted(): void
    {
        self::deleted(queueable(static function (Author $author): void {
            $author->posts()->delete();
        }));
    }
 
    // ...
}
```


Como podemos ver en nuestro ejemplo anterior, hemos envuelto nuestra clausura en la función `Illuminate\Events\queueable`.


## Detectar Eventos de Modelo Usando Observadores

Otro enfoque que puede adoptar para detectar eventos de modelo es utilizar observadores de modelo. Los observadores de modelo le permiten definir todos los detectores de un modelo en una sola clase.

Normalmente, son clases que existen en el directorio `app/Observers` y tienen métodos que corresponden a los eventos de modelo que desea detectar. Por ejemplo, si desea detectar el evento de modelo `deleted`, definiría un método `deleted` en su clase de observador. Si desea detectar el evento de modelo `created`, definiría un método `created` en su clase de observador, y así sucesivamente.

Echemos un vistazo a cómo podríamos crear un observador de modelo para nuestro modelo `App\Models\Author` que detecte el evento de modelo `deleted`:



```php
declare(strict_types=1);
 
namespace App\Observers;
 
use App\Models\Author;
 
final readonly class AuthorObserver
{
    public function deleted(Author $author): void
    {
        $author->posts()->delete();
    }
}
```



Como podemos ver en el código anterior, hemos creado un observador que tiene un método `deleted`. Este método acepta la instancia del modelo `App\Models\Author` que se está eliminando. Luego, eliminamos las publicaciones del autor mediante el método `delete` en la relación `posts`.

Digamos, como ejemplo, que también queremos definir detectores para los eventos de modelo `created` y `updated`. Podríamos actualizar nuestro observador de la siguiente manera:



```php
declare(strict_types=1);
 
namespace App\Observers;
 
use App\Models\Author;
 
final readonly class AuthorObserver
{
    public function created(Author $author): void
    {
        // Logic to run when the author is created...
    }
 
    public function updated(Author $author): void
    {
        // Logic to run when the author is updated...
    }
 
    public function deleted(Author $author): void
    {
        $author->posts()->delete();
    }
}
```


Para que se ejecuten los métodos `App\Observers\AuthorObserver`, necesitamos indicarle a Laravel que los use. Para ello, podemos hacer uso del atributo `#[Illuminate\Database\Eloquent\Attributes\ObservedBy]`. Esto nos permite asociar el observador con el modelo, de forma similar a cómo registraríamos los alcances de consulta globales utilizando el atributo `#[ScopedBy]` (como se muestra en [Aprenda a Dominar los Alcances de Consulta en Laravel](./query-scopes.html)). Podemos actualizar nuestro modelo `App\Models\Author` para utilizar el observador de la siguiente manera:


```php
declare(strict_types=1);
 
namespace App\Models;
 
use App\Observers\AuthorObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
 
#[ObservedBy(AuthorObserver::class)]
final class Author extends Model
{
    // ...
}
```


Me gusta mucho esta forma de definir la lógica del detector porque resulta inmediatamente obvio al abrir una clase de modelo que tiene un observador registrado. Por lo tanto, aunque la lógica sigue estando "oculta" en un archivo separado, podemos saber que tenemos detectores para al menos uno de los eventos del modelo.



## Probando Sus Eventos de Modelo

Independientemente de cuál de los enfoques de eventos de modelo utilice, probablemente desee escribir algunas pruebas para asegurarse de que su lógica se ejecute como se espera.

Echemos un vistazo a cómo podríamos probar los eventos de modelo que hemos creado en nuestros ejemplos anteriores.

Primero, escribiremos una prueba que garantice que las publicaciones de un autor se eliminen suavemente cuando se elimine suavemente al autor. La prueba puede verse así:


```php
declare(strict_types=1);
 
namespace Tests\Feature\Models;
 
use App\Models\Author;
use App\Models\Post;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
 
final class AuthorTest extends TestCase
{
    use LazilyRefreshDatabase;
 
    #[Test]
    public function author_can_be_soft_deleted(): void
    {
        // Create our author and post.
        $author = Author::factory()->create();
 
        $post = Post::factory()->for($author)->create();
 
        // Delete the author.
        $author->delete();
 
        // Assert the author and their associated post
        // is soft-deleted.
        $this->assertSoftDeleted($author);
        $this->assertSoftDeleted($post);
    }
}
```

En la prueba anterior, estamos creando un nuevo autor y una publicación para ese autor. Luego, eliminamos suavemente al autor y confirmamos que tanto el autor como la publicación se eliminaron suavemente.

Esta es una prueba realmente simple, pero efectiva, que podemos usar para asegurarnos de que nuestra lógica esté funcionando como se espera. La belleza de una prueba como esta es que debería funcionar con cada uno de los enfoques que hemos analizado en este artículo. Por lo tanto, si cambia entre cualquiera de los enfoques que hemos analizado, sus pruebas deberían pasar igualmente.

De manera similar, también podemos escribir algunas pruebas para asegurarnos de que el tiempo de lectura de una publicación se calcule cuando la publicación se crea o actualiza. Las pruebas pueden verse así:


```php
declare(strict_types=1);
 
namespace Tests\Feature\Models;
 
use App\Models\Author;
use App\Models\Post;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
 
final class PostTest extends TestCase
{
    use LazilyRefreshDatabase;
 
    #[Test]
    public function read_time_is_calculated_when_storing_post(): void
    {
        $post = Post::factory()
            ->for(Author::factory())
            ->create([
                'content' => 'This is a post with some content.'
            ]);
 
        $this->assertSame(2, $post->read_time_in_seconds);
    }
 
    #[Test]
    public function read_time_is_calculated_when_updating_post(): void
    {
        $post = Post::factory()
            ->for(Author::factory())
            ->create();
 
        $post->content = 'This is a post with some content. ...';
        $post->save();
 
        $this->assertSame(8, $post->read_time_in_seconds);
    }
}
```

Tenemos dos pruebas arriba:

- La primera prueba garantiza que el tiempo de lectura de una publicación se calcule cuando se crea la publicación.
- La segunda prueba garantiza que el tiempo de lectura de una publicación se calcule cuando se actualiza la publicación.

## Problemas al Utilizar Eventos de Modelo

Aunque los eventos de modelo pueden ser muy útiles, hay algunos problemas que se deben tener en cuenta al usarlos.

Los eventos de modelo solo se despachan desde modelos Eloquent. Esto significa que, si está utilizando la fachada `Illuminate\Support\Facades\DB` para interactuar con los datos subyacentes de un modelo en la base de datos, sus eventos no se despachanán.

Por ejemplo, tome este ejemplo simple donde estamos eliminando al autor utilizando la fachada `Illuminate\Support\Facades\DB`:


```php
use Illuminate\Support\Facades\DB;
 
DB::table('authors')
    ->where('id', $author->id)
    ->delete();
```


La ejecución del código anterior eliminaría al autor de la base de datos como se esperaba, pero los eventos de modelo `delete` y `deleted` no se despacharían. Por lo tanto, si ha definido algún detector para estos eventos de modelo cuando se elimine al autor, no se ejecutarán.

De manera similar, si está actualizando o eliminando modelos en masa con Eloquent, los eventos de modelo `saved`, `updated`, `deleteing` y `deleted` no se despacharán para los modelos afectados. Esto se debe a que los eventos se despachan desde los propios modelos. Pero cuando se realiza una actualización y eliminación en masa, los modelos en realidad no se recuperan de la base de datos, por lo que los eventos no se despachan.

Por ejemplo, supongamos que usamos el siguiente código para eliminar un autor:


```php
use App\Models\Author;
 
Author::query()->whereKey($author->id)->delete();
```

Dado que el método `delete` se llama directamente en el generador de consultas, los eventos de modelo `deleteing` y `deleted` no se despacharán para ese autor.

## Enfoques Alternativos a Considerar

Me gusta usar eventos de modelo en mis propios proyectos. Actúan como una excelente manera de desacoplar mi código y también me permiten ejecutar lógica automáticamente cuando no tengo tanto control sobre el código que afecta al modelo. Por ejemplo, si estoy eliminando un autor en Laravel Nova, aún puedo ejecutar algo de lógica cuando se elimina el autor.

Sin embargo, es importante saber cuándo considerar usar un enfoque diferente.

Para explicar este punto, echemos un vistazo a un ejemplo básico de dónde podríamos querer evitar el uso de eventos de modelo. Ampliando nuestros ejemplos de aplicación de blogs simples de antes, imaginemos que queremos ejecutar lo siguiente cada vez que creamos una nueva publicación:

- Calcular el tiempo de lectura de la publicación.
- Hacer una llamada API a X/Twitter para compartir la publicación.
- Enviar una notificación a cada suscriptor en la plataforma.

Entonces, podríamos crear tres detectores separados (uno para cada una de estas tareas) que se ejecutan cada vez que creamos una nueva instancia de `App\Models\Post`.

Pero ahora echemos un vistazo a una de nuestras pruebas anteriores:


```php
declare(strict_types=1);
 
namespace Tests\Feature\Models;
 
use App\Models\Author;
use App\Models\Post;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
 
final class AuthorTest extends TestCase
{
    use LazilyRefreshDatabase;
 
    #[Test]
    public function author_can_be_soft_deleted(): void
    {
        $author = Author::factory()->create();
 
        $post = Post::factory()->for($author)->create();
 
        $author->delete();
 
        $this->assertSoftDeleted($author);
        $this->assertSoftDeleted($post);
    }
}
```


Si ejecutamos la prueba anterior, cuando se crea el modelo `App\Models\Post` a través de su fábrica, también se activarán esas tres acciones. Por supuesto, calcular el tiempo de lectura es una tarea menor, por lo que no importa demasiado. Pero no queremos intentar realizar llamadas a la API ni enviar notificaciones durante una prueba. Estos son efectos secundarios no deseados. Si el desarrollador que escribe las pruebas no es consciente de estos efectos secundarios, puede resultar más difícil rastrear por qué ocurren estas acciones.

También queremos evitar tener que escribir cualquier lógica específica de la prueba en nuestros detectores que impida que estas acciones se ejecuten durante una prueba. Esto haría que el código de la aplicación sea más complejo y más difícil de mantener.

Este es uno de los escenarios en los que es posible que desee considerar un enfoque más explícito en lugar de confiar en eventos de modelo automáticos.

Un enfoque podría ser extraer el código de creación de `App\Models\Post` en una clase de servicio o acción. Por ejemplo, una clase de servicio simple puede verse así:


```php
declare(strict_types=1);
 
namespace App\Services;
 
use App\DataTransferObjects\PostData;
use App\Models\Post;
use Illuminate\Support\Str;
 
final readonly class PostService
{
    public function createPost(PostData $postData): void
    {
        $post = Post::create([
            'title' => $postData->title,
            'content' => $postData->content,
            'author_id' => $postData->authorId,
            'read_time_in_seconds' => $this->calculateReadTime($postData->content),
        ]);
 
        $this->sendPostCreatedNotification($post);
        $this->publishToTwitter($post);
    }
 
    public function updatePost(Post $post, PostData $postData): void
    {
        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'read_time_in_seconds' => $this->calculateReadTime($postData->content),
        ]);
    }
 
    private function calculateReadTime(string $content): int
    {
        return (int) ceil(
            (Str::wordCount($content) / 265) * 60
        );
    }
 
    private function sendPostCreatedNotification(Post $post): void
    {
        // Send a notification to all subscribers...
    }
 
    private function publishToTwitter(Post $post): void
    {
        // Make an API call to Twitter...
    }
}
```


En la clase anterior, llamamos manualmente al código que calcula el tiempo de lectura, envía una notificación y la publica en Twitter. Esto significa que tenemos más control sobre cuándo se ejecutan estas acciones. También podemos simular fácilmente estos métodos en nuestras pruebas para evitar que se ejecuten. También tenemos el beneficio de poder poner en cola estas acciones si es necesario (lo que probablemente haríamos en este escenario).

Como resultado de hacer esto, podemos eliminar el uso de los eventos y los detectores del modelo para estas acciones. Esto significa que podemos usar esta nueva clase `App\Services\PostService` en nuestro código de aplicación y usar de manera segura las fábricas de modelos en nuestro código de prueba.

Una ventaja de hacer esto es que también puede hacer que el código sea más fácil de seguir. Como mencioné brevemente, una crítica común al uso de eventos y detectores es que puede ocultar la lógica empresarial en lugares inesperados. Entonces, si un nuevo desarrollador se une al equipo, es posible que no sepa dónde o por qué suceden ciertas acciones si se activan mediante un evento de modelo.

Sin embargo, si aún desea utilizar eventos y detectores para este tipo de lógica, podría considerar utilizar un enfoque más explícito. Por ejemplo, podría despachar un evento desde la clase de servicio que activa los detectores. De esta manera, aún puede utilizar los beneficios de desacoplamiento de eventos y detectores, pero tiene más control sobre cuándo se despachan los eventos.

Por ejemplo, podríamos actualizar el método `createPost` en nuestro ejemplo `App\Services\PostService` anterior para despachar un evento:


```php
declare(strict_types=1);
 
namespace App\Services;
 
use App\DataTransferObjects\PostData;
use App\Events\PostCreated;
use App\Models\Post;
use Illuminate\Support\Str;
 
final readonly class PostService
{
    public function createPost(PostData $postData): void
    {
        $post = Post::create([
            'title' => $postData->title,
            'content' => $postData->content,
            'author_id' => $postData->authorId,
            'read_time_in_seconds' => $this->calculateReadTime($postData->content),
        ]);
 
        PostCreated::dispatch($post);
    }
 
    // ...
 
}
```

Al utilizar el enfoque anterior, podríamos tener detectores separados para realizar la solicitud de API a Twitter y enviar la notificación. Pero tenemos más control sobre cuándo se ejecutan estas acciones, por lo que no se ejecutan dentro de nuestras pruebas cuando se utilizan fábricas de modelos.

No hay reglas de oro a la hora de decidir utilizar cualquiera de estos enfoques. Se trata de lo que funcione mejor para usted, su equipo y la función que está creando. Sin embargo, tiendo a seguir las siguientes reglas generales:

- Si la acción en el detector solo realiza cambios menores en el modelo, considere usar eventos del modelo. Ejemplos: generar slugs, calcular tiempos de lectura, etc.
- Si la acción afectará a otro modelo (ya sea crear, actualizar o eliminar automáticamente), sea más explícito y no use eventos del modelo.
- Si la acción funcionará con procesos externos (llamadas a la API, manejo de archivos, activación de notificaciones, trabajos en cola), sea más explícito y no use eventos del modelo.


## Pros y contras de usar Eventos de Modelo

Para resumir rápidamente lo que hemos cubierto en este artículo, aquí hay una lista simple de pros y contras de usar eventos de modelo:

### Pros

- Te alienta a desacoplar tu código.
- Te permite activar acciones automáticamente sin importar dónde se creó/actualizó/eliminó el modelo. Por ejemplo, puedes activar la lógica empresarial si el modelo se creó en Laravel Nova.
- No necesitas recordar despachar el evento cada vez que creas/actualizas/eliminas un modelo.

### Contras

- Puede generar efectos secundarios no deseados. Es posible que desees crear/actualizar/eliminar un modelo sin activar algunos de los detectores, pero esto puede generar un comportamiento inesperado. Esto puede ser particularmente problemático al escribir pruebas.
- Puede ocultar la lógica empresarial en lugares inesperados que son difíciles de rastrear. Esto puede hacer que el flujo de tu código sea más difícil de seguir.

## Conclusión

Esperamos que este artículo le haya brindado una descripción general de qué son los eventos de modelo y las diferentes formas de usarlos. También debería haberle mostrado cómo probar su código de evento de modelo y algunos de los problemas que debe tener en cuenta al usarlos.

Es de esperar que ahora se sienta lo suficientemente seguro como para usar eventos de modelo en sus aplicaciones de Laravel.