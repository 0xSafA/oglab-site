<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class OwnershipTransferQuery
{
    public function fetchOwnershipTransfer($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OwnershipTransferController@fetchOwnershipTransferHistories', $args);
    }

    public function fetchSingleOwnershipTransfer($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OwnershipTransferController@fetchOwnerTransferHistory', $args);
    }
}


