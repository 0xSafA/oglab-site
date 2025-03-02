<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class AnalyticsQuery
{
    public function analytics($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@analytics', $args);
    }

    public function popularProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@popularProducts', $args);
    }
    public function bestsellingProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@bestSellingProducts', $args);
    }
    public function categoryWiseProduct($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@categoryWiseProduct', $args);
    }
    public function categoryWiseProductSale($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@categoryWiseProductSale', $args);
    }
    public function lowStockProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@lowStockProducts', $args);
    }
    public function lowStockProductsWithPagination($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@lowStockProductsWithPagination', $args);
    }
    public function topRatedProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AnalyticsController@topRatedProducts', $args);
    }
}
