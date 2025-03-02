<?php

namespace oglab\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use oglab\Database\Models\Refund;

class RefundRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Refund $refund;
    /**
     * Create a new event instance.
     *
     * @param Refund $refund
     */
    public function __construct(Refund $refund)
    {
        $this->refund = $refund;
    }
}
