<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class FlashSaleQuery
{
    public function fetchFlashSales($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@fetchFlashSales', $args);
    }
    public function fetchProductsByFlashSale($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@fetchProductsByFlashSale', $args);
    }
    public function fetchFlashSaleInfoByProductID($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleController@getFlashSaleInfoByProductID', $args);
    }
}
