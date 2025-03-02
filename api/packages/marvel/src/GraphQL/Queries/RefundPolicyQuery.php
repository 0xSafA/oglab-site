<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class RefundPolicyQuery
{
    public function fetchRefundPolicies($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundPolicyController@fetchRefundPolicies', $args);
    }
}
