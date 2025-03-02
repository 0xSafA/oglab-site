<?php


namespace oglab\GraphQL\Mutation;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Exceptions\oglabException;
use oglab\Facades\Shop;

class OrderMutator
{

    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@store', $args);
    }
    public function update($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@updateOrder', $args);
    }
    public function generateInvoiceDownloadUrl($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@downloadInvoiceUrl', $args);
    }
    public function createOrderPayment($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OrderController@submitPayment', $args);
    }
}
