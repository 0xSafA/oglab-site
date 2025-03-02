<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class ProductMutator
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@ProductStore', $args);
    }

    public function updateProduct($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@updateProduct', $args);
    }

    public function importProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@importProducts', $args);
    }
    public function importVariationOptions($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@importVariationOptions', $args);
    }
    public function calculateRentalPrice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@calculateRentalPrice', $args);
    }
    public function destroy($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@destroyProduct', $args);
    }
}
