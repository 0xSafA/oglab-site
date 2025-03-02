<?php


namespace oglab\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Database\Models\Order;

class OrderProcessed implements ShouldQueue
{
    /**
     * @var Order
     */

    public $order;

    /**
     * Create a new event instance.
     *
     * @param Order $order
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }
}
