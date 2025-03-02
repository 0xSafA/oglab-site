<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class SettingsQuery
{
    public function fetchSettings($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\SettingsController@index', $args);
    }
}
