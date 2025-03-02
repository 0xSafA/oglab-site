<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class CouponQuery
{
    public function fetchCoupons($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@fetchCoupons', $args);
    }
}
