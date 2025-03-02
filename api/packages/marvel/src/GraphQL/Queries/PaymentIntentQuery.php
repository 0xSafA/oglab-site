<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class PaymentIntentQuery
{
    public function getPaymentIntent($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\PaymentIntentController@getPaymentIntent', $args);
    }
}
