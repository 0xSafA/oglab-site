<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class QuestionMutator
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\QuestionController@store', $args);
    }

    public function updateQuestion($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\QuestionController@updateQuestion', $args);
    }
}
