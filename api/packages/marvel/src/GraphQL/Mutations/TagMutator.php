<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class TagMutator
{
    public function storeTag($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TagController@store', $args);
    }
    public function updateTag($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TagController@tagUpdate', $args);
    }
}
