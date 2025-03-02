<?php

namespace oglab\Events;

use oglab\Database\Models\User;

class ProcessUserData
{

    protected $appData;
    /**
     * Create a new event instance.
     *
     */
    public function __construct(?array $appData = [])
    {
        $this->appData = $appData;
    }
}
