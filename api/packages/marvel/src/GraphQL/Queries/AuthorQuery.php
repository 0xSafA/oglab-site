<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class AuthorQuery
{
    public function topAuthor($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AuthorController@topAuthor', $args);
    }
    public function fetchAuthors($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\AuthorController@fetchAuthors', $args);
    }
}
