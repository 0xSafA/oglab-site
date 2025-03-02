<?php

namespace oglab\Http\Controllers;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Repositories\RefundPolicyRepository;
use oglab\Enums\Permission;
use oglab\Exceptions\oglabException;
use oglab\Exceptions\oglabNotFoundException;
use oglab\Http\Requests\StoreRefundPolicyRequest;
use oglab\Http\Requests\UpdateRefundPolicyRequest;
use oglab\Http\Resources\RefundPolicyResource;

class RefundPolicyController extends CoreController
{

    public function __construct(private readonly RefundPolicyRepository $repository)
    {
    }


    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     *
     */
    public function index(Request $request)
    {
        $limit = $request->limit ?   $request->limit : 15;
        $refundPolicies =  $this->fetchRefundPolicies($request)->paginate($limit);
        $data = RefundPolicyResource::collection($refundPolicies)->response()->getData(true);
        return formatAPIResourcePaginate($data);
    }

    public function fetchRefundPolicies(Request $request)
    {
        $language = $request->language ?? DEFAULT_LANGUAGE;
        return $this->repository->where('language', $language);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreRefundPolicyRequest $request
     * @return mixed
     */
    public function store(StoreRefundPolicyRequest $request)
    {
        try {
            if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
                return $this->repository->storeRefundPolicy($request);
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (oglabException $e) {
            throw new oglabException(COULD_NOT_CREATE_THE_RESOURCE);
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
            $request->merge(['slug' => $slug]);
            return $this->fetchRefundPolicy($request);
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
    public function fetchRefundPolicy(Request $request)
    {
        $slug = $request->slug;
        $language = $request->language ?? DEFAULT_LANGUAGE;
        try {
            return $this->repository->findRefundPolicy($slug, $language);
        } catch (Exception $e) {
            throw new ModelNotFoundException(NOT_FOUND);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateRefundPolicyRequest $request
     * @param int $id
     * @return array
     * @throws oglab\Exceptions\oglabException
     */
    public function update(UpdateRefundPolicyRequest $request, $id)
    {
        try {
            $request->merge(['id' => $id]);
            return $this->updateRefundPolicy($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_UPDATE_THE_RESOURCE);
        }
    }

    public function updateRefundPolicy(Request $request)
    {
        $slug = $request->id ?? $request->slug;
        $language = $request->language ?? DEFAULT_LANGUAGE;
        if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
            try {
                $refundPolicy = $this->repository->findRefundPolicy($slug, $language);
                return $this->repository->updateRefundPolicy($request, $refundPolicy);
            } catch (Exception $e) {
                throw new oglabNotFoundException(NOT_FOUND);
            }
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
            $request->merge(['id' => $id]);
            return $this->deleteRefundPolicy($request);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_DELETE_THE_RESOURCE);
        }
    }

    public function deleteRefundPolicy(Request $request)
    {
        $slug = $request->id ?? $request->slug;
        $language = $request->language ?? DEFAULT_LANGUAGE;
        if ($request->user()->hasPermissionTo(Permission::SUPER_ADMIN)) {
            $refundPolicy = $this->repository->findRefundPolicy($slug, $language);
            $refundPolicy->delete();
            return $refundPolicy;
        }
        throw new AuthorizationException(NOT_AUTHORIZED);
    }
}
