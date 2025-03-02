<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class RefundPolicyMutator
{
    public function storeRefundPolicy($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundPolicyController@store', $args);
    }
    public function updateRefundPolicy($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundPolicyController@updateRefundPolicy', $args);
    }
    public function deleteRefundPolicy($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundPolicyController@deleteRefundPolicy', $args);
    }
}
