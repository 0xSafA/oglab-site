<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class ManufacturerMutator
{
    public function storeManufacturer($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ManufacturerController@store', $args);
    }
    public function updateManufacturer($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ManufacturerController@updateManufacturer', $args);
    }
    public function deleteManufacturer($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ManufacturerController@deleteManufacturer', $args);
    }
}
