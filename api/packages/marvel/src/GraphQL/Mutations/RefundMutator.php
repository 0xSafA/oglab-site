<?php


namespace oglab\GraphQL\Mutation;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class RefundMutator
{

    public function createRefund($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundController@store', $args);
    }

    public function updateRefund($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundController@updateRefund', $args);
    }
}
