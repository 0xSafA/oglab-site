<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class StoreNoticeQuery
{
    public function fetchStoreNotices($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@fetchStoreNotices', $args);
    }

    public function getStoreNoticeType($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@getStoreNoticeType', $args);
    }

    public function getUsersToNotify($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@getUsersToNotify', $args);
    }
    
}
