<?php


namespace oglab\GraphQL\Mutation;


use oglab\Exceptions\oglabException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class CardMutator
{
    /**
     * @throws oglabException
     */
    public function delete($rootValue, array $args, GraphQLContext $context)
    {
        try {
            return Shop::call('oglab\Http\Controllers\PaymentMethodController@deletePaymentMethod', $args);
        } catch (\Exception $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     * @throws oglabException
     */
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        try {
            return Shop::call('oglab\Http\Controllers\PaymentMethodController@store', $args);
        } catch (\Exception $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     * @throws oglabException
     */
    public function setDefaultPaymentMethod($rootValue, array $args, GraphQLContext $context)
    {
        try {
            return Shop::call('oglab\Http\Controllers\PaymentMethodController@setDefaultPaymentMethod', $args);
        } catch (\Exception $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }
}
