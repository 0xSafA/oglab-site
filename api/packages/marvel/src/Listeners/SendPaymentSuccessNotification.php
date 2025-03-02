<?php

namespace oglab\Listeners;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Enums\EventType;
use oglab\Events\PaymentSuccess;
use oglab\Notifications\PaymentSuccessfulNotification;
use oglab\Traits\OrderSmsTrait;
use oglab\Traits\SmsTrait;

class SendPaymentSuccessNotification implements ShouldQueue
{
    use SmsTrait, OrderSmsTrait;

    /**
     * Handle the event.
     *
     * @param PaymentSuccess $event
     * @return void
     */
    public function handle(PaymentSuccess $event)
    {
        $emailReceiver = $this->getWhichUserWillGetEmail(EventType::ORDER_PAYMENT_SUCCESS, $event->order->language ?? DEFAULT_LANGUAGE);
        if ($emailReceiver['vendor']) {
            foreach ($event->order->children as $key => $child_order) {
                $vendor_id = $child_order->shop->owner_id;
                $vendor = User::findOrFail($vendor_id);
                $vendor->notify(new PaymentSuccessfulNotification($event->order));
            }
        }

        $customer = $event->order->customer;
        if (isset($customer) && $emailReceiver['customer']) {
            $customer->notify(new PaymentSuccessfulNotification($event->order));
        }


        $this->sendPaymentDoneSuccessfullySms($event->order);
    }
}
