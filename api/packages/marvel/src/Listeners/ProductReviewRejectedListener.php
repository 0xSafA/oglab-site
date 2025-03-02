<?php

namespace oglab\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Events\ProductReviewRejected;
use oglab\Notifications\ProductRejectedNotification;

class ProductReviewRejectedListener implements ShouldQueue
{   
    /**
     * Handle the event.
     *
     * @param  ProductReview $event
     * @return void
     */
    public function handle(ProductReviewRejected $event)
    {
        $vendor = $event->product->shop->owner;
        $vendor->notify(new ProductRejectedNotification($event->product));
    }
}
