<?php

namespace oglab\Http\Controllers;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use oglab\Database\Models\StoreNotice;
use oglab\Database\Repositories\StoreNoticeReadRepository;
use oglab\Database\Repositories\StoreNoticeRepository;
use oglab\Enums\Permission;
use oglab\Enums\StoreNoticeType;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\StoreNoticeRequest;
use oglab\Http\Requests\StoreNoticeUpdateRequest;
use oglab\Http\Resources\GetSingleStoreNoticeResource;
use oglab\Http\Resources\StoreNoticeResource;
use Prettus\Validator\Exceptions\ValidatorException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StoreNoticeController extends CoreController
{
    public $repository;
    private $repositoryPivot;

    public function __construct(StoreNoticeRepository $repository, StoreNoticeReadRepository $repositoryPivot)
    {
        $this->repository = $repository;
        $this->repositoryPivot = $repositoryPivot;
    }


    /**
     * @param Request $request
     * @return LengthAwarePaginator|Collection|mixed
     */
    public function index(Request $request)
    {
        try {
            $limit = $request->limit ? $request->limit : 15;
            $storeNotices = $this->fetchStoreNotices($request)->paginate($limit);
            $data = StoreNoticeResource::collection($storeNotices)->response()->getData(true);
            return formatAPIResourcePaginate($data);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG, $th->getMessage());
        }
    }

    /**
     * @param Request $request
     * @return StoreNoticeRepository
     * @throws oglabException
     */
    public function fetchStoreNotices(Request $request)
    {
        return $this->repository->whereNotNull('id');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreNoticeRequest $request
     * @return LengthAwarePaginator|Collection|mixed
     * @throws ValidatorException
     */
    public function store(StoreNoticeRequest $request)
    {
        try {
            if ($request->user()->hasPermissionTo(Permission::SUPER_ADMIN) || $this->repository->hasPermission($request->user(), $request->received_by[0] ?? 0)) {
                return $this->repository->saveStoreNotice($request);
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     * @param Request $request
     * @return array|array[]
     */
    public function getStoreNoticeType(Request $request)
    {
        return $this->repository->fetchStoreNoticeType($request);
    }

    /**
     * This method will generate User list or Shop list based on requested user permission
     * @param Request $request
     * @return \Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws oglabException
     */
    public function getUsersToNotify(Request $request)
    {
        $typeArr = array(StoreNoticeType::ALL_SHOP, StoreNoticeType::ALL_VENDOR);
        if (in_array($request->type, $typeArr)) {
            throw new HttpException(400, ACTION_NOT_VALID);
        }
        return $this->repository->fetchUserToSendNotification($request);
    }

    /**
     * Display the specified resource.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @throws oglabException
     */
    public function show(Request $request, $id)
    {
        try {
            $storeNotice = $this->repository->findOrFail($id);
            // return $storeNotice;
            return new GetSingleStoreNoticeResource($storeNotice);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param StoreNoticeUpdateRequest $request
     * @param $id
     * @return StoreNotice
     * @throws oglabException
     */
    public function update(StoreNoticeUpdateRequest $request, $id)
    {
        try {
            $request['id'] = $id;
            return $this->updateStoreNotice($request);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @return StoreNotice
     * @throws oglabException
     */
    public function updateStoreNotice(Request $request)
    {
        $id = $request->id;
        try {
            if ($request->user()->hasPermissionTo(Permission::SUPER_ADMIN) || $this->repository->hasPermission($request->user(), $request->received_by[0] ?? 0)) {
                $storeNotice = $this->repository->findOrFail($id);
                return $this->repository->updateStoreNotice($request, $storeNotice);
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (Exception $e) {
            throw new HttpException(400, COULD_NOT_DELETE_THE_RESOURCE);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param Request $request
     * @param $id
     * @return bool
     * @throws oglabException
     */
    public function destroy(Request $request, $id)
    {

        try {
            $request['id'] = $id ?? 0;
            return $this->deleteStoreNotice($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_DELETE_THE_RESOURCE);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param Request $request
     * @return mixed
     * @throws oglabException
     */
    public function deleteStoreNotice(Request $request)
    {
        try {
            $id = $request->id;
            return $this->repository->findOrFail($id)->forceDelete();
        } catch (Exception $e) {
            throw new HttpException(400, COULD_NOT_DELETE_THE_RESOURCE);
        }
    }

    /**
     *  Update the specified resource in storage.
     * This method will update read_status of a single StoreNotice for requested user { id in requestBody }.
     * @param Request $request 
     * @return JsonResponse|null
     * @throws oglabException
     */
    public function readNotice(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|exists:oglab\Database\Models\StoreNotice,id'
            ]);
            return $this->repositoryPivot->readSingleNotice($request);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    /**
     *  Update or Store resources in storage.
     * This method will update read_status of a multiple StoreNotice for requested user { array of id in requestBody }.
     * @param Request $request 
     * @return JsonResponse|null
     * @throws oglabException
     */
    public function readAllNotice(Request $request)
    {
        try {
            $request->validate([
                'notices' => 'required|array|min:1',
                'notices.*' => 'exists:oglab\Database\Models\StoreNotice,id',
            ]);
            return $this->repositoryPivot->readAllNotice($request);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }
}
