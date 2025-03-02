<?php


namespace oglab\GraphQL\Mutation;


use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use oglab\Facades\Shop;


class NotifyLogMutator
{
    public function readNotifyLogs($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\NotifyLogsController@readNotifyLogs', $args);
    }
    public function notifyLogAllRead($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\NotifyLogsController@readAllNotifyLogs', $args);
    }
    public function deleteNotifyLogs($rootValue, array $args, GraphQLContext $context)
    {
        return Shop::call('oglab\Http\Controllers\NotifyLogsController@deleteNotifyLogs', $args);
    }
}
