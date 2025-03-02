<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

// TODO use this as a graphql resolver and fix the issues
class FaqMutator
{
    public function storeFaq($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FaqsController@store', $args);
    }
    public function updateFaq($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FaqsController@updateFaqs', $args);
    }
    public function deleteFaq($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\FaqsController@deleteFaq', $args);
    }
}
