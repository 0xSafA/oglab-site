<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class RefundReasonQuery
{
    public function fetchRefundReasons($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\RefundReasonController@fetchRefundReasons', $args);
    }
}
