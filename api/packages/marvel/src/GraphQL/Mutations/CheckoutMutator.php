<?php


namespace oglab\GraphQL\Mutation;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class CheckoutMutator
{

    public function verify($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\CheckoutController@verify', $args);
    }
}
