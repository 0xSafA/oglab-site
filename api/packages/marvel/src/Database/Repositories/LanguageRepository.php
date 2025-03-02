<?php


namespace oglab\Database\Repositories;

use oglab\Database\Models\Language;

class LanguageRepository extends BaseRepository
{
    /**
     * Configure the Model
     **/
    public function model()
    {
        return Language::class;
    }
}
