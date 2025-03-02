<?php

namespace oglab\Http\Controllers;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Models\Type;
use oglab\Database\Repositories\TypeRepository;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\TypeRequest;
use oglab\Http\Resources\TypeResource;
use Prettus\Validator\Exceptions\ValidatorException;

class TypeController extends CoreController
{
    public $repository;

    public function __construct(TypeRepository $repository)
    {
        $this->repository = $repository;
    }


    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Collection|Type[]
     */
    public function index(Request $request)
    {
        $language = $request->language ?? DEFAULT_LANGUAGE;
        $types = $this->repository->where('language', $language)->get();
        return TypeResource::collection($types);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param TypeRequest $request
     * @return mixed
     * @throws ValidatorException
     */
    public function store(TypeRequest $request)
    {
        try {
            return $this->repository->storeType($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_CREATE_THE_RESOURCE);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param $slug
     * @return JsonResponse
     */
    public function show(Request $request, $params)
    {

        try {
            $language = $request->language ?? DEFAULT_LANGUAGE;
            if (is_numeric($params)) {
                $params = (int) $params;
                $type = $this->repository->where('id', $params)->with('banners')->firstOrFail();
                return new TypeResource($type);
            }
            $type = $this->repository->where('slug', $params)->where('language', $language)->with('banners')->firstOrFail();
            return new TypeResource($type);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param TypeRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(TypeRequest $request, $id)
    {
        $request->id = $id;
        return $this->updateType($request);
    }

    public function updateType(TypeRequest $request)
    {
        try {
            $type = $this->repository->with('banners')->findOrFail($request->id);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
        return $this->repository->updateType($request, $type);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id)
    {
        try {
            return $this->repository->findOrFail($id)->delete();
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
    }
}
