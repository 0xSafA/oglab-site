<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class MessageQuery
{
    public function fetchMessages($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\MessageController@fetchMessages', $args);
    }
}
