<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class CategoryMutator
{
    public function storeCategory($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CategoryController@store', $args);
    }
    public function updateCategory($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CategoryController@categoryUpdate', $args);
    }
}
