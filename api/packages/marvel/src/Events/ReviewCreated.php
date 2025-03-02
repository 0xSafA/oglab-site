<?php

namespace App\Events;

use oglab\Database\Models\Review;

class ReviewCreated
{
    public $review;

    /**
     * Create a new event instance.
     *
     * @param Review $review
     */
    public function __construct(Review $review)
    {
        $this->review = $review;
    }
}
