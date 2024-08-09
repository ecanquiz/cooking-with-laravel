# Afirmando una Estructura de Respuesta JSON en Laravel

:::info
La fuente original (en ingles) de este tutorial se encuentra [aquí](https://laravel-news.com/asserting-json-response-structure-in-laravel)
:::

![laravel-assert-json-structure-featured](./img/laravel-assert-json-structure-featured.avif)


Al escribir pruebas para respuestas de API en Laravel, puede resultar útil validar la estructura de la respuesta. Laravel cuenta con el método `assertJson()`, que se puede utilizar para verificar valores JSON en una respuesta de prueba determinada:



```php
it('Returns Arizona sports teams', function () {
    $this->get('api/teams/arizona')
        ->assertJson(function (AssertableJson $json) {
            $json->has('teams', 3);
            $json->has('teams.0', function (AssertableJson $json) {
                $json
                    ->where('name', 'Phoenix Suns')
                    ->etc();
            });
        });
});
```


Dada la prueba anterior, aquí hay un ejemplo estático de los datos JSON:


```sh
{
    "teams": [
        {
            "name": "Phoenix Suns",
            "sport": "Basketball"
        },
        {
            "name": "Arizona Cardinals",
            "sport": "Football"
        },
        {
            "name": "Arizona Diamondbacks",
            "sport": "Baseball"
        }
    ]
}
```


Nuestra prueba valida que se enumeran tres equipos en Arizona y que la propiedad `name` existe en el primer registro. Esto es excelente para validar los valores reales para muestrear la respuesta utilizando las potentes API de aserción JSON en Laravel. Para complementar esas aserciones, también podemos validar la estructura general de toda la respuesta:


```php
$response->assertJsonStructure([
    'teams' => [
        '*' => ['name', 'sport'],
    ],
]);
```


Una advertencia sobre la aserción `assertJsonStucture()`: si agregamos una nueva clave en el futuro, esta prueba seguirá pasando. Si necesita más exactitud, es posible que deba recurrir a `assertExactJson()`. Para generalizar una estructura JSON para garantizar que existan propiedades específicas en la respuesta, `assertJsonStructure()` puede brindarle la seguridad de que toda la estructura contiene las propiedades que espera.

Si necesita aserciones más extensas sobre la estructura del JSON, es posible que también desee recurrir a las aserciones `whereType()` y `whereAllType()`. Dado nuestro ejemplo anterior, podría validar los tipos en sus respuestas JSON utilizando lo siguiente:


```php
$response->assertJson(function (AssertableJson $json) {
    $json->has('teams', 3);
    $json->has('teams.0', function (AssertableJson $json) {
        $json->whereAllType([
            'name' => 'string',
            'sport' => 'string',
        ]);
    });
});
```


El uso de `whereAllType` requiere que definamos tipos para todas y cada una de las claves en el elemento `teams`, a menos que use lo anterior con `->etc()`:


```php
$json->whereAllType([
    'name' => 'string',
    // 'sport' => 'string',
])->etc();
```


Como se mencionó, el código anterior no confirma la respuesta completa y asume que los otros equipos tienen la misma estructura. Puede confirmar cada equipo en la matriz e incluso usar datos de fábrica de Eloquent para validar que los valores de respuesta coincidan. Por lo general, la combinación de las aserciones anteriores garantizará que tenga la forma de respuesta JSON esperada y puede mezclar aserciones más complicadas cuando sea necesario. Consulte la [documentación](https://laravel.com/docs/11.x/http-tests#testing-json-apis) de Laravel para obtener más ejemplos y aserciones JSON útiles.

