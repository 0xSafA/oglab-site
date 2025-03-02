<?php

namespace oglab\Http\Controllers;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Models\Manufacturer;
use oglab\Database\Repositories\ManufacturerRepository;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\ManufacturerRequest;
use oglab\Http\Resources\ManufacturerResource;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ManufacturerController extends CoreController
{
    public $repository;

    public function __construct(ManufacturerRepository $repository)
    {
        $this->repository = $repository;
    }


    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Collection|Manufacturer[]
     */
    public function index(Request $request)
    {
        $language = $request->language ?? DEFAULT_LANGUAGE;
        $limit = $request->limit ?   $request->limit : 15;
        $manufacturers = $this->repository->where('language', $language)->with('type')->paginate($limit);
        $data = ManufacturerResource::collection($manufacturers)->response()->getData(true);
        return formatAPIResourcePaginate($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param ManufacturerRequest $request
     * @return mixed
     */
    public function store(ManufacturerRequest $request)
    {
        try {
            if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
                return $this->repository->storeManufacturer($request);
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (oglabException $th) {
            throw new oglabException(NOT_AUTHORIZED);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param $slug
     * @return JsonResponse
     */
    public function show(Request $request, $slug)
    {
        try {
            $request['slug'] = $slug;
            $manufacturer = $this->fetchManufacturer($request);
            return new ManufacturerResource($manufacturer);
        } catch (oglabException $th) {
            throw new oglabException(NOT_FOUND);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param $slug
     * @return JsonResponse
     */
    public function fetchManufacturer(Request $request)
    {

        try {
            $slug = $request->slug;
            $language = $request->language ?? DEFAULT_LANGUAGE;
            if (is_numeric($slug)) {
                $slug = (int) $slug;
                return $this->repository->with('type')->where('id', $slug)->firstOrFail();
            }
            return $this->repository->with('type')->where('slug', $slug)->where('language', $language)->firstOrFail();
        } catch (Exception $th) {
            throw new HttpException(404, NOT_FOUND);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param ManufacturerRequest $request
     * @param int $id
     * @return array
     */
    public function update(ManufacturerRequest $request, $id)
    {
        try {
            $request['id'] = $id;
            return $this->updateManufacturer($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_UPDATE_THE_RESOURCE);
        }
    }

    public function updateManufacturer(Request $request)
    {
        if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
            try {
                $Manufacturer = $this->repository->findOrFail($request->id);
            } catch (\Exception $e) {
                throw new HttpException(404, NOT_FOUND);
            }
            return $this->repository->updateManufacturer($request, $Manufacturer);
        }
        throw new AuthorizationException(NOT_AUTHORIZED);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return JsonResponse
     */
    public function destroy($id, Request $request)
    {
        try {
            $request['id'] = $id;
            return $this->deleteManufacturer($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_DELETE_THE_RESOURCE);
        }
    }

    public function deleteManufacturer(Request $request)
    {
        if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
            $manufacturer = $this->repository->findOrFail($request->id);
            $manufacturer->delete();
            return $manufacturer;
        }
        throw new oglabException(NOT_AUTHORIZED);
    }

    public function topManufacturer(Request $request)
    {
        $limit = $request->limit ? $request->limit : 10;
        $language = $request->language ?? DEFAULT_LANGUAGE;
        return $this->repository->where('language', $language)->withCount('products')->orderBy('products_count', 'desc')->take($limit)->get();
    }
}
