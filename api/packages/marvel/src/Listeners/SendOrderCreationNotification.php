<?php

namespace oglab\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Enums\EventType;
use oglab\Events\OrderCreated;
use oglab\Notifications\NewOrderReceived;
use oglab\Notifications\OrderPlacedSuccessfully;
use oglab\Traits\OrderSmsTrait;
use oglab\Traits\SmsTrait;

class SendOrderCreationNotification implements ShouldQueue
{
    use SmsTrait, OrderSmsTrait;

    /**
     * Handle the event.
     *
     * @param OrderCreated $event
     * @return void
     */
    public function handle(OrderCreated $event)
    {
        $order = $event->order;
        $customer = $event->order->customer;
        $emailReceiver = $this->getWhichUserWillGetEmail(EventType::ORDER_CREATED, $order->language);
        if ($customer && $emailReceiver['customer'] && $order->parent_id == null) {
            $customer->notify(new OrderPlacedSuccessfully($event->invoiceData));
        }
        if ($emailReceiver['admin']) {
            $admins = $this->adminList();
            foreach ($admins as $admin) {
                $admin->notify(new NewOrderReceived($order, 'admin'));
            }
        }
        $this->sendOrderCreationSms($order);
    }
}
