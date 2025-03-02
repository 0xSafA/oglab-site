<?php

namespace oglab\Listeners;

use App\Events\ReviewCreated;
use App\Notifications\NewReviewCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use oglab\Database\Models\NotifyLogs;
use oglab\Database\Models\Order;
use oglab\Database\Models\Shop;
use oglab\Enums\EventType;
use Illuminate\Support\Facades\Cache;
use oglab\Database\Models\User;
use oglab\Enums\Permission;
use oglab\Events\StoreNoticeEvent;
use oglab\Traits\UsersTrait;

class StoredStoreNoticeNotifyLogsListener implements ShouldQueue
{

    use UsersTrait;

    /**
     * Handle the event.
     *
     * @param  StoreNoticeEvent  $event
     * @return void
     */
    public function handle(StoreNoticeEvent $event)
    {
        // save notification for vendor
        if (isset($event->storeNotice->users)) {
            foreach ($event->storeNotice->users as $key => $user) {
                NotifyLogs::create([
                    'receiver' => $user->id,
                    'sender' =>  $event->user->id,
                    'notify_type' => 'store_notice',
                    'notify_receiver_type' => 'vendor',
                    'is_read' => false,
                    'notify_text' =>  mb_substr($event->storeNotice->notice, 0, 15) . '...',
                    'notify_tracker' => $event->storeNotice->id
                ]);
            }
        }
    }
}
