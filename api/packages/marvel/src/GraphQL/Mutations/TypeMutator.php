<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class TypeMutator
{
    public function storeType($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TypeController@store', $args);
    }
    public function updateType($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TypeController@updateType', $args);
    }
}
