# Aprenda a dominar los Ámbitos de Consulta en Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/query-scopes)
:::

![laravel-validation](./img/query-scopes.avif)


Al crear aplicaciones Laravel, es probable que deba escribir consultas que tengan restricciones que se utilicen en varios lugares de la aplicación. Tal vez esté creando una aplicación multiusuario y tenga que seguir agregando una restricción `where` a sus consultas para filtrar por el equipo del usuario. O tal vez esté creando un blog y tenga que seguir agregando una restricción `where` a sus consultas para filtrar si la publicación del blog se publicó o no.

En Laravel, podemos utilizar ámbitos de consulta para ayudarnos a mantener estas restricciones ordenadas y reutilizables en un solo lugar.

En este artículo, analizaremos los ámbitos de consulta locales y globales. Aprenderemos sobre la diferencia entre ambos, cómo crear los suyos propios y cómo escribir pruebas para ellos.

Al final del artículo, debería sentirse seguro al utilizar ámbitos de consulta en sus aplicaciones Laravel.

## ¿Qué son los Ámbitos de Consulta?

Los ámbitos de consulta le permiten definir restricciones en sus consultas de Eloquent de una manera reutilizable. Por lo general, se definen como métodos en sus modelos de Laravel o como una clase que implementa la interfaz `Illuminate\Database\Eloquent\Scope`.

No solo son excelentes para definir lógica reutilizable en un solo lugar, sino que también pueden hacer que su código sea más legible al ocultar restricciones de consulta complejas detrás de una simple llamada de método.

Los ámbitos de consulta vienen en dos tipos diferentes:

- **Ámbitos de consulta locales** - Debe aplicar estos ámbitos manualmente a sus consultas.
- **Ámbitos de consulta globales** - Estos ámbitos se aplican a todas las consultas del modelo de forma predeterminada después de que se registra la consulta.

Si alguna vez ha utilizado la funcionalidad _"soft delete"_ incorporada de Laravel, es posible que ya haya utilizado ámbitos de consulta sin darse cuenta. Laravel utiliza ámbitos de consulta locales para proporcionarle métodos como `withTrashed` y `onlyTrashed` en sus modelos. También utiliza un ámbito de consulta global para agregar automáticamente una restricción `whereNull('deleted_at')` a todas las consultas en el modelo para que los registros eliminados de forma suave no se devuelvan en las consultas de forma predeterminada.

Echemos un vistazo a cómo podemos crear y utilizar ámbitos de consulta locales y globales en nuestras aplicaciones Laravel.


## Ámbitos de Consulta Locales

Los ámbitos de consulta locales se definen como métodos en su modelo Eloquent y le permiten definir restricciones que se pueden aplicar manualmente a las consultas de su modelo.

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


Aquí es donde los ámbitos de consulta pueden resultar extremadamente útiles. Por lo tanto, ordenemos nuestras consultas creando ámbitos de consulta locales en el modelo `\App\Models\Article`.

Los ámbitos de consulta locales se definen mediante la creación de un método que comienza con la palabra `scope` y termina con el nombre deseado del ámbito. Por ejemplo, un método llamado `scopePublished` creará un ámbito `published` en el modelo. El método debe aceptar una instancia `Illuminate\Contracts\Database\Eloquent\Builder` y devolver una instancia `Illuminate\Contracts\Database\Eloquent\Builder`.

Agregaremos ambos ámbitos al modelo `\App\Models\Article`:


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

Como podemos ver en el ejemplo anterior, hemos trasladado nuestras restricciones `where` de nuestras consultas anteriores a dos métodos separados: `scopePublished` y `scopeNotPublished`. Ahora podemos usar estos ámbitos en nuestras consultas de esta manera:


```php
use App\Models\Article;
 
$publishedPosts = Article::query()
    ->published()
    ->get();
 
$unpublishedPosts = Article::query()
    ->notPublished()
    ->get();
```


En mi opinión, me parece que estas consultas son mucho más fáciles de leer y comprender. Esto también significa que, si en el futuro necesitamos escribir consultas con la misma restricción, podemos reutilizar estos ámbitos.


## Global Query Scopes



