<?php


namespace oglab\Database\Repositories;

use oglab\Database\Models\DeliveryTime;

class DeliveryTimeRepository extends BaseRepository
{
    /**
     * Configure the Model
     **/
    public function model()
    {
        return DeliveryTime::class;
    }
}
