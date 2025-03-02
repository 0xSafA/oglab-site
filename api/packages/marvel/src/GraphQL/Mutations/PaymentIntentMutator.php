<?php


namespace oglab\GraphQL\Mutation;


use oglab\Exceptions\oglabException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class PaymentIntentMutator
{
    /**
     * @throws oglabException
     */
    public function savePaymentMethod($rootValue, array $args, GraphQLContext $context)
    {
        try {
            return Shop::call('oglab\Http\Controllers\PaymentMethodController@savePaymentMethod', $args);
        } catch (\Exception $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }
}
