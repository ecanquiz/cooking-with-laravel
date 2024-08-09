# Uso de Eloquent Factories con Proveedores de Datos PHPUnit

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/eloquent-factories-with-phpunit-data-providers)
:::

![eloquent-factories-data-provider](./img/eloquent-factories-data-provider.avif)



Hay algunas formas de trabajar con las fábricas de Laravel en pruebas de características, como crear un modelo durante `setUp()` cuando desea usarlo para múltiples pruebas o directamente en un caso de prueba individual. Si tiene un caso de prueba que desea probar con una variedad de datos, es posible que desee recurrir a los [proveedores de datos](https://docs.phpunit.de/en/11.3/writing-tests-for-phpunit.html#data-providers) de PHPUnit con modelos Eloquent.

El uso de proveedores de datos con pruebas de características puede plantear un problema porque se ejecutan antes de que Laravel se inicie a través del `TestCase` del marco que se ejecuta durante `setUp()`. Los proveedores de datos se resuelven al principio del proceso de ejecución de `phpunit`, por lo que se encontrará con el siguiente error si desea usarlos:


```php
<?php
 
namespace Tests\Feature;
 
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;
 
class ExampleTest extends TestCase
{
    use RefreshDatabase;
 
    #[DataProvider('nonAdminUsers')]
    public function test_non_admin_users_cannot_access_admin($user): void
    {
        $response = $this
            ->actingAs($user())
            ->get('/admin')
            ->assertStatus(403);
    }
 
    public static function nonAdminUsers(): array
    {
        return [
            [User::factory()->player()->create()],
            [User::factory()->coach()->create()],
            [User::factory()->owner()->create()],
        ];
    }
}
```


Si ejecuta la prueba anterior, debería obtener algo como el siguiente error, según la versión de Laravel que esté usando; lo siguiente es lo que obtengo en Laravel 11:



```sh
$ vendor/bin/phpunit tests/Feature/ExampleTest.php
 
There was 1 PHPUnit error:
 
1) Tests\Feature\ExampleTest::test_non_admin_users_cannot_access_admin
The data provider specified for Tests\Feature\ExampleTest::test_non_admin_users_cannot_access_admin is invalid
A facade root has not been set.
 
tests/Feature/ExampleTest.php:18
```


Esto se debe a que, cuando se ejecuta el código del proveedor de datos, la aplicación Laravel no se ha iniciado. Si eres un usuario de PHP de Pest, el ejemplo de [Conjuntos de Datos Vinculados](https://pestphp.com/docs/datasets#content-bound-datasets) ilustra el uso de una clausura para los datos del modelo:


```php
it('can generate the full name of a user', function (User $user) {
    expect($user->full_name)->toBe("{$user->first_name} {$user->last_name}");
})->with([
    fn() => User::factory()->create(['first_name' => 'Nuno', 'last_name' => 'Maduro']),
    fn() => User::factory()->create(['first_name' => 'Luke', 'last_name' => 'Downing']),
    fn() => User::factory()->create(['first_name' => 'Freek', 'last_name' => 'Van Der Herten']),
]);
```


En PHPUnit, podríamos usar clausura para pasar código a nuestra prueba a través de proveedores de datos sin intentar crear los datos inmediatamente:


```php
namespace Tests\Feature;
 
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;
 
class ExampleTest extends TestCase
{
    use RefreshDatabase;
 
    #[DataProvider('nonAdminUsers')]
    public function test_non_admin_users_cannot_access_admin($user): void
    {
        $response = $this
            ->actingAs($user())
            ->get('/admin')
            ->assertStatus(403);
    }
 
    public static function nonAdminUsers(): array
    {
        return [
            [fn(): User => User::factory()->player()->create()],
            [fn(): User => User::factory()->coach()->create()],
            [fn(): User => User::factory()->owner()->create()],
        ];
    }
}
```


Tenga en cuenta la llamada `$user()`, que pasamos a `actingAs()`. Si necesita utilizar el modelo en varios lugares, simplemente asígnelo a una variable. Ahora, los datos de fábrica se crean en la prueba, que es precisamente lo que queremos. Para obtener más información sobre las pruebas de características HTTP en Laravel, consulte la [documentación](https://laravel.com/docs/11.x/http-tests).


