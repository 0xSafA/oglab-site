<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class TermsConditionsMutator
{
    public function storeTermsConditions($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@store', $args);
    }
    public function updateTermsConditions($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@updateTermsAndConditions', $args);
    }
    public function deleteTermsConditions($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@deleteTermsConditions', $args);
    }
    public function approveTerm($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@approveTerm', $args);
    }
    public function disApproveTerm($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@disApproveTerm', $args);
    }
}
