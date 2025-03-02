<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class OrderQuery
{
    public function fetchOrders($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@fetchOrders', $args);
    }

    public function fetchSingleOrder($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@fetchSingleOrder', $args);
    }
}
