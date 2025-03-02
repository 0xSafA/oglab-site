<?php


namespace oglab\GraphQL\Mutation;

use oglab\Facades\Shop;
use Illuminate\Support\Facades\Log;
use oglab\Exceptions\oglabException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CouponMutator
{

    public function verify($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@verify', $args);
    }

    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@store', $args);
    }

    public function update($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@updateCoupon', $args);
    }
    public function approveCoupon($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@approveCoupon', $args);
    }
    public function disApproveCoupon($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CouponController@disApproveCoupon', $args);
    }
}
