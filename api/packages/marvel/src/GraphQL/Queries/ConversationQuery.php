<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class ConversationQuery
{
    public function fetchConversations($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\ConversationController@fetchConversations', $args);
    }
}
