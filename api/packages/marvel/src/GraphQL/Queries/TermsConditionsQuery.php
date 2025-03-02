<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class TermsConditionsQuery
{
    public function fetchTermsConditions($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\TermsAndConditionsController@fetchTermsAndConditions', $args);
    }
}
