<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class MessageMutator
{
    public function store($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\MessageController@storeMessage', $args);
    }

    public function seenMessage($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\MessageController@seenMessage', $args);
    }
}
