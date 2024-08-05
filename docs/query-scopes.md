# Aprenda a Dominar los Alcances de Consulta en Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/query-scopes)
:::

![laravel-validation](./img/query-scopes.avif)


Al crear aplicaciones Laravel, es probable que deba escribir consultas que tengan restricciones que se utilicen en varios lugares de la aplicación. Tal vez esté creando una aplicación multiusuario y tenga que seguir agregando una restricción `where` a sus consultas para filtrar por el equipo del usuario. O tal vez esté creando un blog y tenga que seguir agregando una restricción `where` a sus consultas para filtrar si la publicación del blog se publicó o no.

En Laravel, podemos utilizar alcances de consulta para ayudarnos a mantener estas restricciones ordenadas y reutilizables en un solo lugar.

En este artículo, analizaremos los alcances de consulta locales y globales. Aprenderemos sobre la diferencia entre ambos, cómo crear los suyos propios y cómo escribir pruebas para ellos.

Al final del artículo, debería sentirse seguro al utilizar alcances de consulta en sus aplicaciones Laravel.

## ¿Qué son los Alcances de Consulta?

Los alcances de consulta le permiten definir restricciones en sus consultas de Eloquent de una manera reutilizable. Por lo general, se definen como métodos en sus modelos de Laravel o como una clase que implementa la interfaz `Illuminate\Database\Eloquent\Scope`.

No solo son excelentes para definir lógica reutilizable en un solo lugar, sino que también pueden hacer que su código sea más legible al ocultar restricciones de consulta complejas detrás de una simple llamada de método.

Los alcances de consulta vienen en dos tipos diferentes:

- **Alcances de consulta locales** - Debe aplicar estos alcances manualmente a sus consultas.
- **Alcances de consulta globales** - Estos alcances se aplican a todas las consultas del modelo de forma predeterminada después de que se registra la consulta.

Si alguna vez ha utilizado la funcionalidad _"soft delete"_ incorporada de Laravel, es posible que ya haya utilizado alcances de consulta sin darse cuenta. Laravel utiliza alcances de consulta locales para proporcionarle métodos como `withTrashed` y `onlyTrashed` en sus modelos. También utiliza un alcance de consulta global para agregar automáticamente una restricción `whereNull('deleted_at')` a todas las consultas en el modelo para que los registros eliminados de forma suave no se devuelvan en las consultas de forma predeterminada.

Echemos un vistazo a cómo podemos crear y utilizar alcances de consulta locales y globales en nuestras aplicaciones Laravel.


## Alcances de Consulta Locales

Los alcances de consulta locales se definen como métodos en su modelo Eloquent y le permiten definir restricciones que se pueden aplicar manualmente a las consultas de su modelo.

Imaginemos que estamos creando una aplicación de blogs que tiene un panel de administración. En el panel de administración, tenemos dos páginas: una para enumerar las publicaciones de blog publicadas y otra para enumerar las publicaciones de blog no publicadas.

Imaginaremos que se accede a las publicaciones del blog mediante un modelo `\App\Models\Article` y que la tabla de la base de datos tiene una columna `published_at` que acepta valores nulos y que almacena la fecha y la hora en que se publicará la publicación del blog. Si la columna `published_at` está en el pasado, la publicación del blog se considera publicada. Si la columna published_at está en el futuro o es `null`, la publicación del blog se considera no publicada.

Para obtener las publicaciones del blog publicadas, podríamos escribir una consulta como esta:


```php
use App\Models\Article;
 
$publishedPosts = Article::query()
    ->where('published_at', '<=', now())
    ->get();
```

Para obtener las publicaciones del blog no publicadas, podríamos escribir una consulta como esta:


```php
use App\Models\Article;
use Illuminate\Contracts\Database\Eloquent\Builder;
 
$unpublishedPosts = Article::query()
    ->where(function (Builder $query): void {
        $query->whereNull('published_at')
            ->orWhere('published_at', '>', now());
    })
    ->get();
```

Las consultas anteriores no son particularmente complejas. Sin embargo, imaginemos que las estamos usando en varios lugares de nuestra aplicación. A medida que aumenta la cantidad de veces que aparecen, es más probable que cometamos un error u olvidemos actualizar la consulta en un lugar. Por ejemplo, un desarrollador podría usar accidentalmente `>=` en lugar de `<=` al consultar publicaciones de blog publicadas. O bien, la lógica para determinar si una publicación de blog está publicada podría cambiar y necesitaremos actualizar todas las consultas.


Aquí es donde los alcances de consulta pueden resultar extremadamente útiles. Por lo tanto, ordenemos nuestras consultas creando alcances de consulta locales en el modelo `\App\Models\Article`.

Los alcances de consulta locales se definen mediante la creación de un método que comienza con la palabra `scope` y termina con el nombre deseado del alcance. Por ejemplo, un método llamado `scopePublished` creará un alcances `published` en el modelo. El método debe aceptar una instancia `Illuminate\Contracts\Database\Eloquent\Builder` y devolver una instancia `Illuminate\Contracts\Database\Eloquent\Builder`.

Agregaremos ambos alcances al modelo `\App\Models\Article`:


```php
declare(strict_types=1);
 
namespace App\Models;
 
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
final class Article extends Model
{
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published_at', '<=', now());
    }
 
    public function scopeNotPublished(Builder $query): Builder
    {
        return $query->where(function (Builder $query): Builder {
            return $query->whereNull('published_at')
                ->orWhere('published_at', '>', now());
        });
    }
 
    // ...
}
```

Como podemos ver en el ejemplo anterior, hemos trasladado nuestras restricciones `where` de nuestras consultas anteriores a dos métodos separados: `scopePublished` y `scopeNotPublished`. Ahora podemos usar estos alcances en nuestras consultas de esta manera:


```php
use App\Models\Article;
 
$publishedPosts = Article::query()
    ->published()
    ->get();
 
$unpublishedPosts = Article::query()
    ->notPublished()
    ->get();
```


En mi opinión, me parece que estas consultas son mucho más fáciles de leer y comprender. Esto también significa que, si en el futuro necesitamos escribir consultas con la misma restricción, podemos reutilizar estos alcances.


## Alcances de Consulta Global

Los alcances de consulta global realizan una función similar a los alcances de consulta local. Pero en lugar de aplicarse manualmente consulta por consulta, se aplican automáticamente a todas las consultas del modelo.

Como mencionamos anteriormente, la funcionalidad de _"soft delete"_ incorporada de Laravel hace uso del alcance de consulta global `Illuminate\Database\Eloquent\SoftDeletingScope`. Este alcance agrega automáticamente una restricción `whereNull('deleted_at')` a todas las consultas del modelo. Puede consultar el código fuente en [GitHub aquí](https://github.com/laravel/framework/blob/11.x/src/Illuminate/Database/Eloquent/SoftDeletingScope.php) si está interesado en ver cómo funciona en profundidad.

Por ejemplo, imagine que está creando una aplicación de blogs multiusuario que tiene un panel de administración. Solo querría permitir que los usuarios vean los artículos que pertenecen a su equipo. Por lo tanto, podría escribir una consulta como esta:


```php
use App\Models\Article;
 
$articles = Article::query()
    ->where('team_id', Auth::user()->team_id)
    ->get();
```

Esta consulta está bien, pero es fácil olvidarse de agregar la restricción `where`. Si estuviera escribiendo otra consulta y olvidara agregar la restricción, terminaría con un error en su aplicación que permitiría a los usuarios interactuar con artículos que no pertenecen a su equipo. ¡Por supuesto, no queremos que eso suceda!

Para evitar esto, podemos crear un alcance global que podamos aplicar automáticamente a todas nuestras consultas de modelo `App\Model\Article`.

## Cómo Crear Alcances de Consulta Global

Creemos un alcance de consulta global que filtre todas las consultas por la columna `team_id`.

Tenga en cuenta que vamos a simplificar el ejemplo para los fines de este artículo. En una aplicación del mundo real, probablemente desee utilizar un enfoque más sólido que se ocupe de cuestiones como que el usuario no esté autenticado o que el usuario pertenezca a varios equipos. Pero por ahora, simplifiquemos las cosas para poder centrarnos en el concepto de alcances de consulta globales.

Comenzaremos ejecutando el siguiente comando de _Artisan_ en nuestra terminal:


```sh
php artisan make:scope TeamScope
```

Esto debería haber creado un nuevo archivo `app/Models/Scopes/TeamScope.php`. Realizaremos algunas actualizaciones en este archivo y luego veremos el código terminado:


```php
declare(strict_types=1);
 
namespace App\Models\Scopes;
 
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
 
final readonly class TeamScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('team_id', Auth::user()->team_id);
    }
}
```

En el ejemplo de código anterior, podemos ver que tenemos una nueva clase que implementa la interfaz `Illuminate\Database\Eloquent\Scope` y tiene un solo método llamado `apply`. Este es el método donde definimos las restricciones que queremos aplicar a las consultas en el modelo.

Nuestro alcance global ahora está listo para usarse. Podemos agregarlo a cualquier modelo en el que queramos limitar el alcance de las consultas hasta el equipo del usuario.

Apliquémoslo al modelo `\App\Models\Article`.


## Aplicación de Alcances de Consulta Global

Existen varias formas de aplicar un alcance global a un modelo. La primera forma es utilizar el atributo `Illuminate\Database\Eloquent\Attributes\ScopedBy` en el modelo:



```php
declare(strict_types=1);
 
namespace App\Models;
 
use App\Models\Scopes\TeamScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
 
#[ScopedBy(TeamScope::class)]
final class Article extends Model
{
    // ...
}
```


Otra forma es utilizar el método `addGlobalScope` en el método `booted` del modelo:



```php
declare(strict_types=1);
 
namespace App\Models;
 
use App\Models\Scopes\TeamScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 
final class Article extends Model
{
    use HasFactory;
 
    protected static function booted(): void
    {
        static::addGlobalScope(new TeamScope());
    }
 
    // ...
}
```


Ambos enfoques aplicarán la restricción `where('team_id', Auth::user()->team_id)` a todas las consultas en el modelo `\App\Models\Article`.

Esto significa que ahora puedes escribir consultas sin tener que preocuparte por filtrar por la columna `team_id`:


```php
use App\Models\Article;
 
$articles = Article::query()->get();
```

Si asumimos que el usuario es parte de un equipo con el `team_id` de `1`, se generaría el siguiente SQL para la consulta anterior:

```sql
select * from `articles` where `team_id` = 1
```

¡Eso es genial, ¿verdad?!



## Alcances de Consulta Global Anónimos

Otra forma de definir y aplicar un alcance de consulta global es utilizar un alcance global anónimo.

Actualicemos nuestro modelo `\App\Models\Article` para utilizar un alcance global anónimo:



```php
declare(strict_types=1);
 
namespace App\Models;
 
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
 
final class Article extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('team_scope', static function (Builder $builder): void {
            $builder->where('team_id', Auth::user()->team_id);
        });
    }
 
    // ...
}
```

En el ejemplo de código anterior, hemos utilizado el método `addGlobalScope` para definir un alcance global anónimo en el método `booted` del modelo. El método `addGlobalScope` acepta dos argumentos:

- **El nombre del alcance** - Se puede utilizar para hacer referencia al alcance más adelante si necesita ignorarlo en una consulta
- **Las restricciones del alcance** -  Un cierre que define las restricciones que se aplicarán a las consultas


Al igual que los otros enfoques, este aplicará la restricción `where('team_id', Auth::user()->team_id)` a todas las consultas en el modelo `\App\Models\Article`.

En mi experiencia, los alcances globales anónimos son menos comunes que definir un alcance global en una clase separada. Pero es bueno saber que están disponibles para su uso si los necesita.



## Ignorar Alcances de Consulta Global

Puede haber ocasiones en las que desee escribir una consulta que no utilice un alcance de consulta global que se haya aplicado a un modelo. Por ejemplo, puede estar creando un informe o una consulta de análisis que necesite incluir todos los registros, independientemente de los alcances de consulta global.

Si este es el caso, puede utilizar uno de los dos métodos para ignorar los alcances globales.

El primer método es `withoutGlobalScopes`. Este método le permite ignorar todos los alcances globales en el modelo si no se le pasan argumentos:


```php
use App\Models\Article;
 
$articles = Article::query()->withoutGlobalScopes()->get();
```

O, si prefieres ignorar solo un conjunto determinado de alcances globales, puedes asignar los nombres de alcance al método `withoutGlobalScopes`:


```php
use App\Models\Article;
use App\Models\Scopes\TeamScope;
 
$articles = Article::query()
    ->withoutGlobalScopes([
        TeamScope::class,
        'another_scope',
    ])->get();
```

En el ejemplo anterior, ignoramos `App\Models\Scopes\TeamScope` y otro alcance global anónimo imaginario llamado `another_scope`.


Alternativamente, si prefiere ignorar un único alcance global, puede utilizar el método `withoutGlobalScope`:



```php
use App\Models\Article;
use App\Models\Scopes\TeamScope;
 
$articles = Article::query()->withoutGlobalScope(TeamScope::class)->get();
```


## Problemas con Alcance de Consultas Globales

Es importante recordar que los alcances de las consultas globales solo se aplican a las consultas realizadas a través de sus modelos. Si está escribiendo una consulta de base de datos utilizando la fachada `Illuminate\Support\Facades\DB`, los alcances de las consultas globales no se aplicarán.

Por ejemplo, supongamos que escribe esta consulta que esperaría que solo tomara los artículos que pertenecen al equipo del usuario que inició sesión:


```php
use Illuminate\Support\Facades\DB;
 
$articles = DB::table('articles')->get();
```


En la consulta anterior, el alcance de consulta global `App\Models\Scopes\TeamScope` no se aplicará incluso si el alcance está definido en el modelo `App\Models\Article`. Por lo tanto, deberá asegurarse de aplicar manualmente la restricción en las consultas de su base de datos.



## Prueba de Alcances de Consulta Locales

Ahora que hemos aprendido a crear y utilizar alcances de consulta, veremos cómo podemos escribir pruebas para ellos.

Hay varias formas de probar alcances de consulta y el método que elija puede depender de sus preferencias personales o del contenido del alcance que esté escribiendo. Por ejemplo, puede que desee escribir más pruebas de estilo unitario para los alcances. O puede que desee escribir más pruebas de estilo de integración que prueben el alcance en el contexto de su uso en algo como un controlador.

Personalmente, me gusta utilizar una combinación de ambos para poder tener la confianza de que los alcances están agregando las restricciones correctas y de que realmente se están utilizando en las consultas.

Tomemos nuestros ejemplos de alcances `published` y `notPublished` de antes y escribamos algunas pruebas para ellos. Vamos a escribir dos pruebas diferentes (una para cada alcance):

- Una prueba que comprueba el alcance `published` solo devuelve artículos que han sido publicados.
- Una prueba que comprueba el alcance `notPublished` solo devuelve artículos que no han sido publicados.

Echemos un vistazo a las pruebas y luego analicemos lo que se está haciendo:



```php
declare(strict_types=1);
 
namespace Tests\Feature\Models\Article;
 
use App\Models\Article;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
 
final class ScopesTest extends TestCase
{
    use LazilyRefreshDatabase;
 
    protected function setUp(): void
    {
        parent::setUp();
 
        // Create two published articles.
        $this->publishedArticles = Article::factory()
            ->count(2)
            ->create([
                'published_at' => now()->subDay(),
            ]);
 
        // Create an unpublished article that hasn't
        // been scheduled to publish.
        $this->unscheduledArticle = Article::factory()
            ->create([
                'published_at' => null,
            ]);
 
        // Create an unpublished article that has been
        // scheduled to publish.
        $this->scheduledArticle = Article::factory()
            ->create([
                'published_at' => now()->addDay(),
            ]);
    }
 
    #[Test]
    public function only_published_articles_are_returned(): void
    {
        $articles = Article::query()->published()->get();
 
        $this->assertCount(2, $articles);
        $this->assertTrue($articles->contains($this->publishedArticles->first()));
        $this->assertTrue($articles->contains($this->publishedArticles->last()));
    }
 
    #[Test]
    public function only_not_published_articles_are_returned(): void
    {
        $articles = Article::query()->notPublished()->get();
 
        $this->assertCount(2, $articles);
        $this->assertTrue($articles->contains($this->unscheduledArticle));
        $this->assertTrue($articles->contains($this->scheduledArticle));
    }
}
```



En el archivo de prueba anterior, podemos ver que primero estamos creando algunos datos en el método `setUp`. Estamos creando dos artículos publicados, un artículo no programado y un artículo programado.

Luego, hay una prueba (`only_published_articles_are_returned`) que verifica que el alcance `published` solo devuelva los artículos publicados. Y hay otra prueba (`only_not_published_articles_are_returned`) que verifica que el alcance `notPublished` solo devuelva los artículos que no se han publicado.

Al hacer esto, ahora podemos tener la confianza de que nuestros alcances de consulta están aplicando las restricciones como se esperaba.


## Prueba de Alcances en Controladores

Como mencionamos, otra forma de probar alcances de consulta es probarlos en el contexto de su uso en un controlador. Si bien una prueba aislada para el alcance puede ayudar a afirmar que un alcance está agregando las restricciones correctas a una consulta, en realidad no prueba que el alcance se esté utilizando como se pretende en la aplicación. Por ejemplo, es posible que haya olvidado agregar el alcance `published` a una consulta en un método de controlador.

Este tipo de errores se pueden detectar escribiendo pruebas que aseguren que se devuelven los datos correctos cuando se utiliza el alcance en un método de controlador.

Tomemos nuestro ejemplo de tener una aplicación de blogs multiusuario y escribamos una prueba para un método de controlador que enumera artículos. Supondremos que tenemos un método de controlador muy simple como el siguiente:



```php
declare(strict_types=1);
 
namespace App\Http\Controllers;
 
use App\Models\Article;
use Illuminate\Http\Request;
 
final class ArticleController extends Controller
{
    public function index()
    {
        return view('articles.index', [
            'articles' => Article::all(),
        ]);
    }
}
```


Supondremos que el modelo `App\Models\Article` tiene nuestro `App\Models\Scopes\TeamScope` aplicado.

Queremos asegurarnos de que solo se devuelvan los artículos que pertenecen al equipo del usuario. El caso de prueba puede verse así:



```php
declare(strict_types=1);
 
namespace Tests\Feature\Controllers\ArticleController;
 
use App\Models\Article;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
 
final class IndexTest extends TestCase
{
    use LazilyRefreshDatabase;
 
    #[Test]
    public function only_articles_belonging_to_the_team_are_returned(): void
    {
        // Create two new teams.
        $teamOne = Team::factory()->create();
        $teamTwo = Team::factory()->create();
 
        // Create a user that belongs to team one.
        $user = User::factory()->for($teamOne)->create();
 
        // Create 3 articles for team one.
        $articlesForTeamOne = Article::factory()
            ->for($teamOne)
            ->count(3)
            ->create();
 
        // Create 2 articles for team two.
        Article::factory()
            ->for($teamTwo)
            ->count(2)
            ->create();
 
        // Act as the user and make a request to the controller method. We'll
        // assert that only the articles belonging to team one are returned.
        $this->actingAs($user)
            ->get('/articles')
            ->assertOk()
            ->assertViewIs('articles.index')
            ->assertViewHas(
                key: 'articles',
                value: fn (Collection $articles): bool => $articles->pluck('id')->all()
                    === $articlesForTeamOne->pluck('id')->all()
            );
    }
}
```


En la prueba anterior, estamos creando dos equipos. Luego, estamos creando un usuario que pertenece al equipo uno. Estamos creando 3 artículos para el equipo uno y 2 artículos para el equipo dos. Luego, actuamos como el usuario y realizamos una solicitud al método del controlador que enumera los artículos. El método del controlador solo debería devolver los 3 artículos que pertenecen al equipo uno, por lo que estamos afirmando que solo se devuelvan esos artículos comparando los identificadores de los artículos.

Esto significa que podemos tener la confianza de que el alcance de la consulta global se está utilizando como se esperaba en el método del controlador.


## Conclusión

En este artículo, aprendimos sobre los alcances de consulta locales y globales. Aprendimos sobre la diferencia entre ambos, cómo crear los tuyos propios y usarlos, y cómo escribir pruebas para ellos.

Con suerte, ahora deberías sentirte seguro al usar alcances de consulta en tus aplicaciones Laravel.