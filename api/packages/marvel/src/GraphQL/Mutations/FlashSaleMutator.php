<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class FlashSaleMutator
{
    public function storeFlashSale($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@store', $args);
    }
    public function updateFlashSale($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@updateFlashSale', $args);
    }
    public function deleteFlashSale($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@deleteFlashSale', $args);
    }
}
