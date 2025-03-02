<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class AuthorMutator
{
    public function storeAuthor($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AuthorController@store', $args);
    }
    public function updateAuthor($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AuthorController@updateAuthor', $args);
    }
    public function deleteAuthor($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AuthorController@deleteAuthor', $args);
    }
}
