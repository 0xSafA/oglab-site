<?php

namespace oglab\Listeners\Refund;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Enums\EventType;
use oglab\Events\RefundUpdate;
use oglab\Traits\OrderSmsTrait;
use oglab\Traits\SmsTrait;

class SendRefundUpdateNotification implements ShouldQueue
{
    use SmsTrait, OrderSmsTrait;

    /**
     * Handle the event.
     * @param RefundUpdate $event
     * @return void
     */
    public function handle(RefundUpdate $event)
    {
        $refund = $event->refund;
        $order = $refund->order;
        if ($order->parent_id) return;
        $emailReceiver = $this->getWhichUserWillGetEmail(EventType::ORDER_REFUND, $event->refund->order->language);

        if ($emailReceiver['customer'] && $refund->customer()) {
            $refund->customer->notify(new RefundUpdate($refund, 'customer'));
        }

        if ($emailReceiver['admin']) {
            $admins = $this->adminList();
            foreach ($admins as $admin) {
                $admin->notify(new RefundUpdate($refund, 'admin'));
            }
        }
    }
}
