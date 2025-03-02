<?php

namespace oglab\Listeners;


use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use oglab\Database\Models\User;
use oglab\Enums\Permission;
use oglab\Events\StoreNoticeEvent;
use oglab\Notifications\StoreNoticeNotification;

class StoreNoticeListener implements ShouldQueue
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param StoreNoticeEvent $event
     * @return void
     */
    public function handle(StoreNoticeEvent $event)
    {
        $users = User::whereHas('permissions', function (Builder $query) {
            $query->whereIn('name', [Permission::SUPER_ADMIN]);
        })->get();

        if (!empty($users)) {
            foreach ($users as $user) {
                $user->notify(new StoreNoticeNotification($event->storeNotice, $event->action));
            }
        }
    }
}
