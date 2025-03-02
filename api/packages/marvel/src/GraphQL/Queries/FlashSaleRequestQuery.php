<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class FlashSaleRequestQuery
{
    public function fetchFlashSaleRequests($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleVendorRequestController@fetchFlashSalesRequests', $args);
    }
    public function fetchFlashSaleRequestedProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FlashSaleVendorRequestController@fetchRequestedProducts', $args);
    }
}
