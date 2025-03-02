<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class UserQuery
{
    public function fetchStaff($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\UserController@fetchStaff', $args);
    }
    public function me($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\UserController@me', $args);
    }
    public function fetchDownloadableFiles($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\DownloadController@fetchFiles', $args);
    }

    public function fetchWishlists($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@fetchWishlists', $args);
    }
    public function inWishlist($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WishlistController@inWishlist', $args);
    }
    public function fetchMyStaffs($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\UserController@fetchMyStaffs', $args);
    }
    public function fetchUsersByPermission($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\UserController@fetchUsersByPermission', $args);
    }
}
