<?php

namespace oglab\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use oglab\Database\Models\Balance;
use oglab\Database\Models\Order;
use oglab\Database\Models\Refund;
use oglab\Database\Models\Shop;
use oglab\Database\Models\User;

class CommissionRateUpdateEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Shop $shop;
    public Balance $balance;

    /**
     * Create a new event instance.
     *
     * @param Shop $shop
     * @param Balance $balance
     */
    public function __construct(Shop $shop, Balance $balance)
    {
        $this->shop = $shop;
        $this->balance = $balance;
    }
}
