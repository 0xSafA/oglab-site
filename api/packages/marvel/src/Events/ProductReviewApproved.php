<?php


namespace oglab\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Database\Models\Product;

class ProductReviewApproved implements ShouldQueue
{
    /**
     * @var Product
     */

    public $product;

    /**
     * Create a new event instance.
     *
     * @param Product $product
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }
}
