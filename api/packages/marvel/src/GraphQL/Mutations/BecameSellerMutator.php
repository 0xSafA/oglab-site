<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class BecameSellerMutator
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\BecameSellerController@store', $args);
    }
}
