<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class BecameSellerQuery
{
    public function fetchBecameSeller($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\BecameSellerController@index', $args);
    }
}
