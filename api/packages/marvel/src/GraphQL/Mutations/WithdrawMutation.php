<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class WithdrawMutation
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WithdrawController@store', $args);
    }
    public function approveWithdraw($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\WithdrawController@approveWithdraw', $args);
    }
}
