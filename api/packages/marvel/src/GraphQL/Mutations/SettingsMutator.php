<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class SettingsMutator
{
    public function update($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\SettingsController@store', $args);
    }
}
