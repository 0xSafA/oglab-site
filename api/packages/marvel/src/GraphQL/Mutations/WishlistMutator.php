<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class WishlistMutator
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WishlistController@store', $args);
    }

    public function toggle($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WishlistController@toggle', $args);
    }

    public function delete($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WishlistController@delete', $args);
    }
}
