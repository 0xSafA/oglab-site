<?php

namespace oglab\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Enums\EventType;
use oglab\Events\OrderReceived;
use oglab\Notifications\NewOrderReceived;
use oglab\Traits\SmsTrait;

class SendOrderReceivedNotification implements ShouldQueue
{
    use SmsTrait;
    /**
     * Handle the event.
     *
     * @param OrderReceived $event
     * @return void
     */
    public function handle(OrderReceived $event)
    {
        $emailReceiver = $this->getWhichUserWillGetEmail(EventType::ORDER_CREATED, $event->order->language);
        if ($emailReceiver['vendor']) {
            $vendor = $event->order->shop->owner;
            $vendor->notify(new NewOrderReceived($event->order));
        }
    }
}
