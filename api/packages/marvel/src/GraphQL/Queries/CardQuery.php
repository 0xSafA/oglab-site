<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class CardQuery
{
    public function fetchCards($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\PaymentMethodController@index', $args);
    }
}
