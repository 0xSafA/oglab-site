<?php


namespace oglab\Database\Repositories;

use oglab\Database\Models\Address;

class AddressRepository extends BaseRepository
{
    /**
     * Configure the Model
     **/
    public function model()
    {
        return Address::class;
    }
}
