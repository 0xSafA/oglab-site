<?php


namespace oglab\GraphQL\Queries;

use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class ProductQuery
{
    public function relatedProducts($rootValue, array $args, GraphQLContext $context)
    {
        $args['slug'] = $rootValue->slug;
        return Shop::call('oglab\Http\Controllers\ProductController@relatedProducts', $args);
    }
    public function fetchProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@fetchProducts', $args);
    }
    public function fetchProductStock($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@fetchProductStock', $args);
    }
    public function fetchDraftedProducts($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ProductController@fetchDraftedProducts', $args);
    }
    public function fetchDigitalFilesForProduct($rootValue, array $args, GraphQLContext $context)
    {
        $args['parent_id'] = $rootValue->id;
        return Shop::call('oglab\Http\Controllers\ProductController@fetchDigitalFilesForProduct', $args);
    }
    public function fetchDigitalFilesForVariation($rootValue, array $args, GraphQLContext $context)
    {
        $args['parent_id'] = $rootValue->id;
        return Shop::call('oglab\Http\Controllers\ProductController@fetchDigitalFilesForVariation', $args);
    }
}
