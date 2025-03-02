<?php

namespace oglab\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Models\Faqs;
use oglab\Database\Repositories\FaqsRepository;
use oglab\Enums\Permission;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\CreateFaqsRequest;
use oglab\Http\Requests\UpdateFaqsRequest;
use oglab\Http\Resources\FaqResource;
use Prettus\Validator\Exceptions\ValidatorException;

class FaqsController extends CoreController
{
    public $repository;

    public function __construct(FaqsRepository $repository)
    {
        $this->repository = $repository;
    }


    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Collection|Faqs[]
     */
    public function index(Request $request)
    {
        $limit = $request->limit ? $request->limit : 10;
        $language = $request->language ?? DEFAULT_LANGUAGE;
        $faqs = $this->fetchFAQs($request)->where('language', $language)->paginate($limit)->withQueryString();
        $data = FaqResource::collection($faqs)->response()->getData(true);
        return formatAPIResourcePaginate($data);
    }


    /**
     * fetchFAQs
     *
     * @param  Request $request
     * @return object
     */
    public function fetchFAQs(Request $request)
    {
        $language = $request->language ?? DEFAULT_LANGUAGE;
        try {
            $user = $request->user();

            if ($user) {
                switch ($user) {
                    case $user->hasPermissionTo(Permission::SUPER_ADMIN):
                        return $this->repository
                            ->with('shop')
                            ->whereNotNull('id')
                            ->where('language', $language);
                        break;

                    case $user->hasPermissionTo(Permission::STORE_OWNER):
                        if ($this->repository->hasPermission($user, $request->shop_id)) {
                            return $this->repository
                                ->with('shop')
                                ->where('shop_id', '=', $request->shop_id)
                                ->where('language', $language);
                        } else {
                            return $this->repository
                                ->with('shop')
                                ->where('user_id', '=', $user->id)
                                ->where('language', $language)
                                ->whereIn('shop_id', $user->shops->pluck('id'));
                        }
                        break;

                    case $user->hasPermissionTo(Permission::STAFF):
                        // if ($this->repository->hasPermission($user, $request->shop_id)) {
                        return $this->repository
                            ->with('shop')
                            ->where('shop_id', '=', $request->shop_id)
                            ->where(
                                'language',
                                $language
                            );
                        // }
                        break;

                    default:
                        return $this->repository
                            ->with('shop')
                            ->where('language', $language)
                            ->whereNotNull('id');
                        break;
                }
            } else {
                if ($request->shop_id) {
                    return $this->repository
                        ->with('shop')
                        ->where('shop_id', '=', $request->shop_id)
                        ->where('language', $language)
                        ->whereNotNull('id');
                } else {
                    return $this->repository
                        ->with('shop')
                        ->where('language', $language)
                        ->whereNotNull('id');
                }
            }
        } catch (oglabException $e) {
            throw new oglabException(SOMETHING_WENT_WRONG, $e->getMessage());
        }
    }

    /**
     * Store a newly created faq in storage.
     *
     * @param CreateFaqsRequest $request
     * @return mixed
     * @throws ValidatorException
     */
    public function store(CreateFaqsRequest $request)
    {
        try {
            return $this->repository->storeFaqs($request);
            // return $this->repository->create($validatedData);
        } catch (oglabException $e) {
            throw new oglabException(COULD_NOT_CREATE_THE_RESOURCE, $e->getMessage());
        }
    }

    /**
     * Display the specified faq.
     *
     * @param $id
     * @return JsonResponse
     */
    public function show($id)
    {
        try {
            $faq = $this->repository->with('shop')->findOrFail($id);
            return new FaqResource($faq);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND, $e->getMessage());
        }
    }

    /**
     * Update the specified faqs
     *
     * @param UpdateFaqsRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateFaqsRequest $request, $id)
    {
        try {
            $request["id"] = $id;
            return $this->updateFaqs($request);
        } catch (oglabException $e) {
            throw new oglabException(COULD_NOT_UPDATE_THE_RESOURCE, $e->getMessage());
        }
    }

    /**
     * updateFaqs
     *
     * @param  UpdateFaqsRequest $request
     * @return void
     */
    public function updateFaqs(UpdateFaqsRequest $request)
    {
        $faqs = $this->repository->findOrFail($request['id']);
        return $this->repository->updateFaqs($request, $faqs);
    }

    /**
     * Remove the specified faqs
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy($id, Request $request)
    {
        $request->merge(['id' => $id]);
        return $this->deleteFaq($request);
    }

    public function deleteFaq(Request $request)
    {
        try {
            $id = $request->id;
            $user = $request->user();
            if ($user && ($user->hasPermissionTo(Permission::SUPER_ADMIN) || $user->hasPermissionTo(Permission::STORE_OWNER) || $user->hasPermissionTo(Permission::STAFF))) {
                return $this->repository->findOrFail($id)->delete();
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND, $e->getMessage());
        }
    }
}
