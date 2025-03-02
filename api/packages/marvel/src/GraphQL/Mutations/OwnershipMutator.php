<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class OwnershipMutator
{
    public function updateOwnership($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OwnershipTransferController@updateOwnershipTransfer', $args);
    }
    public function deleteOwnership($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\OwnershipTransferController@deleteOwnershipTransfer', $args);
    }
}