<?php


namespace oglab\GraphQL\Queries;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;

class NotifyLogQuery
{
    public function fetchNotifyLogs($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\NotifyLogsController@fetchNotifyLogs', $args);
    }
}
