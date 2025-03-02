<?php

namespace oglab\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Events\ProductReviewApproved;
use oglab\Notifications\ProductApprovedNotification;

class ProductReviewApprovedListener implements ShouldQueue
{   
    /**
     * Handle the event.
     *
     * @param  ProductReview $event
     * @return void
     */
    public function handle(ProductReviewApproved $event)
    {
        $vendor = $event->product->shop->owner;
        $vendor->notify(new ProductApprovedNotification($event->product));
    }
}
