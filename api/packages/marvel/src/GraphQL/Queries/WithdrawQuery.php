<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class WithdrawQuery
{
    public function fetchWithdraws($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WithdrawController@fetchWithdraws', $args);
    }

    public function fetchSingleWithdraw($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WithdrawController@fetchSingleWithdraw', $args);
    }
}
