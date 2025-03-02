<?php

namespace oglab\Database\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use oglab\Traits\TranslationTrait;

class Availability extends Model
{
    use TranslationTrait;

    protected $table = 'availabilities';

    public $guarded = [];
}
