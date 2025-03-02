<?php


namespace oglab\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Database\Models\FlashSale;
use oglab\Database\Models\Order;

class FlashSaleProcessed implements ShouldQueue
{

    public $action;

    public $language;

    public $optional_data;

    /**
     * Create a new event instance.
     *
     * @param  $flash_sale
     */
    public function __construct($action, $language = null, $optional_data = null)
    {
        $this->action = $action;
        $this->language = $language;
        $this->optional_data = $optional_data;
    }
}
