<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class RefundReasonMutator
{
    public function storeRefundReason($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundReasonController@store', $args);
    }
    public function updateRefundReason($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundReasonController@refundReasonUpdate', $args);
    }
    public function deleteRefundReason($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundReasonController@deleteRefundReason', $args);
    }
}
