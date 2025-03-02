<?php

namespace oglab\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Database\Models\User;
use oglab\Enums\EventType;
use oglab\Events\OrderStatusChanged;
use oglab\Notifications\OrderStatusChangedNotification;
use oglab\Traits\OrderSmsTrait;
use oglab\Traits\SmsTrait;

class SendOrderStatusChangedNotification implements ShouldQueue
{
    use SmsTrait, OrderSmsTrait;

    /**
     * Handle the event.
     *
     * @param OrderStatusChanged $event
     * @return void
     */
    public function handle(OrderStatusChanged $event)
    {

        $order = $event->order;
        $customer = $event->order->customer;


        $this->sendOrderStatusChangeSms($order);
        $emailReceiver = $this->getWhichUserWillGetEmail(EventType::ORDER_STATUS_CHANGED, $order->language ?? DEFAULT_LANGUAGE);
        if ($emailReceiver['vendor'] && $order->parent_id != null) {
            $vendor_id = $order->shop->owner_id;
            $vendor = User::find($vendor_id);

            if ($vendor)
                $vendor->notify(new OrderStatusChangedNotification($event->order));
        }
        if ($emailReceiver['customer'] && $order->parent_id == null) {
            $customer->notify(new OrderStatusChangedNotification($event->order));
        }
        if ($emailReceiver['admin']) {
            $admins = $this->adminList();
            foreach ($admins as $key => $admin) {
                $admin->notify(new OrderStatusChangedNotification($order));
            }
        }
    }
}
