<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class ShopQuery
{
    public function fetchShops($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ShopController@fetchShops', $args);
    }

    public function fetchFollowedShops($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ShopController@followedShops', $args);
    }

    public function followedShopsPopularProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ShopController@followedShopsPopularProducts', $args);
    }
    public function findShopDistance($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ShopController@findShopDistance', $args);
    }
}
