<?php


namespace oglab\Database\Repositories;

use oglab\Database\Models\AttributeValue;
use Prettus\Repository\Criteria\RequestCriteria;
use Prettus\Repository\Exceptions\RepositoryException;

class AttributeValueRepository extends BaseRepository
{

    /**
     * @var array
     */
    protected $fieldSearchable = [
        'value'        => 'like',
        'shop_id',
        'language',
    ];

    public function boot()
    {
        try {
            $this->pushCriteria(app(RequestCriteria::class));
        } catch (RepositoryException $e) {
        }
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return AttributeValue::class;
    }
}
