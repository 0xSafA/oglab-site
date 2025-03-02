<?php


namespace oglab\GraphQL\Mutation;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class StoreNoticeMutator
{

    public function createStoreNotice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@store', $args);
    }

    public function updateStoreNotice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@updateStoreNotice', $args);
    }
    public function deleteStoreNotice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@deleteStoreNotice', $args);
    }
    public function readNotice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@readNotice', $args);
    }
    public function readAllNotice($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\StoreNoticeController@readAllNotice', $args);
    }
}
