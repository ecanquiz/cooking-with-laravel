# Una Guía para los Eventos Modelo de Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/model-events)
:::


![model-events](./img/model-events.avif)


Los eventos de modelo son una característica muy útil en Laravel que puede ayudarte a ejecutar lógica automáticamente cuando se realizan ciertas acciones en tus modelos Eloquent. Pero a veces pueden provocar efectos secundarios extraños si no se usan correctamente.

En este artículo, veremos qué son los eventos de modelo y cómo usarlos en tu aplicación Laravel. También veremos cómo probar tus eventos de modelo y algunos de los problemas que debes tener en cuenta al usarlos. Finalmente, veremos algunos enfoques alternativos a los eventos de modelo que quizás quieras considerar usar.

## ¿Qué son los Eventos y los Oyentes?

Es posible que ya hayas oído hablar de los "eventos" y los "oyentes". Pero si no es así, aquí tienes un breve resumen de lo que son:


### Eventos

Son cosas que suceden en tu aplicación y sobre las que quieres actuar, por ejemplo, un usuario que se registra en tu sitio, un usuario que inicia sesión, etc.

Normalmente, en Laravel, los eventos son clases PHP. Aparte de los eventos proporcionados por el framework o paquetes de terceros, normalmente se guardan en el directorio `app/Events`.

A continuación, se muestra un ejemplo de una clase de evento simple que podrías querer enviar cada vez que un usuario se registre en tu sitio:



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

Cuando se despacha, el evento disparará cualquier oyente que lo esté escuchando.

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


En el ejemplo anterior, creamos un nuevo usuario y luego despachamos el evento `App\Events\UserRegistered` con la instancia del usuario. Suponiendo que los oyentes estén registrados correctamente, esto disparará cualquier oyente que esté escuchando el evento `App\Events\UserRegistered`.



### Oyentes

Los oyentes son bloques de código que quieres ejecutar cuando ocurre un evento específico.

Por ejemplo, siguiendo con nuestro ejemplo de registro de usuario, es posible que quieras enviar un correo electrónico de bienvenida al usuario cuando se registre. Podrías crear un oyente que escuche el evento `App\Events\UserRegistered` y envíe el correo electrónico de bienvenida.

En Laravel, los oyente son típicamente (pero no siempre, lo cubriremos más adelante) clases que se encuentran en el directorio `app/Listeners`.

Un ejemplo de un oyente que envía un correo electrónico de bienvenida a un usuario cuando se registra podría verse así:


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


Como podemos ver en el ejemplo de código anterior, la clase oyente `App\Listeners\SendWelcomeEmail` tiene un método `handle` que acepta una instancia de evento `App\Events\UserRegistered`. Este método es responsable de enviar un correo electrónico de bienvenida al usuario.

Para obtener una explicación más detallada de los eventos y los oyentes, es posible que desee consultar la documentación oficial: https://laravel.com/docs/11.x/events


## ¿Qué son los Eventos de Modelo?

En las aplicaciones de Laravel, normalmente necesitarás despachar eventos manualmente cuando ocurran determinadas acciones. Como vimos en nuestro ejemplo anterior, podemos usar el siguiente código para despachar un evento:


```php
UserRegistered::dispatch($user);
```

Sin embargo, cuando trabajamos con modelos Eloquent en Laravel, hay algunos eventos que se despachan automáticamente, por lo que no necesitamos despacharlos manualmente. Solo necesitamos definir oyentes para ellos si queremos realizar una acción cuando ocurren.

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


## Escuchar Eventos de Modelo Usando `dispatchesEvents`

Una forma de escuchar eventos de modelo es definir una propiedad `dispatchesEvents` en su modelo.

Esta propiedad le permite mapear eventos de modelo de Eloquent a las clases de eventos que se deben despachar cuando ocurre el evento. Esto significa que puede definir sus oyentes como lo haría con cualquier otro evento.

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


- Se agregó una propiedad `dispatchesEvents` que asigna el evento de modelo `deleted` a la clase de evento `App\Events\AuthorDeleted`. Esto significa que cuando se elimina el modelo, se enviará un nuevo evento `App\Events\AuthorDeleted`. Crearemos esta clase de evento en unos momentos.
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

- Se agregó una propiedad `dispatchesEvents` que asigna el evento del modelo `saving` a la clase de evento `App\Events\PostSaving`. Esto significa que cuando se crea o se actualiza el modelo, se enviará un nuevo evento `App\Events\PostSaving`. Crearemos esta clase de evento en unos momentos.
- Se definió una relación `author`.
- Se habilitaron las eliminaciones suaves en el modelo mediante el rasgo `Illuminate\Database\Eloquent\SoftDeletes`.

Nuestros modelos ahora están preparados, así que creemos nuestras clases de evento `App\Events\AuthorDeleted` y `App\Events\PostSaving`.


### Creating the Event Classes

