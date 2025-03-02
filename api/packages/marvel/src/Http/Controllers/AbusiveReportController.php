<?php


namespace oglab\Http\Controllers;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Models\AbusiveReport;
use oglab\Database\Repositories\AbusiveReportRepository;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\AbusiveReportAcceptOrRejectRequest;
use oglab\Http\Requests\AbusiveReportCreateRequest;
use Prettus\Validator\Exceptions\ValidatorException;


class AbusiveReportController extends CoreController
{
    public $repository;

    public function __construct(AbusiveReportRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Collection|AbusiveReport[]
     */
    public function index(Request $request)
    {
        $limit = $request->limit ?   $request->limit : 15;
        return $this->repository->paginate($limit);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param AbusiveReportCreateRequest $request
     * @return mixed
     * @throws ValidatorException
     */
    public function store(AbusiveReportCreateRequest $request)
    {

        try {
            $model_id = $request['model_id'];
            $model_type = $request['model_type'];
            $model_name = "oglab\\Database\\Models\\{$model_type}";
            $model = $model_name::findOrFail($model_id);
            $request['user_id'] = $request->user()->id;
            return $this->repository->storeAbusiveReport($request, $model);
        } catch (oglabException $e) {
            throw new oglabException(COULD_NOT_CREATE_THE_RESOURCE);
        }
    }

    public function show($id)
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
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

    public function accept(AbusiveReportAcceptOrRejectRequest $request)
    {
        try {
            $model_id = $request['model_id'];
            $model_type = $request['model_type'];
            $model = $model_type::findOrFail($model_id);
            return $model->delete();
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
    }

    public function reject(AbusiveReportAcceptOrRejectRequest $request)
    {
        $model_id = $request['model_id'];
        $model_type = str_replace("\\", "\\", $request['model_type']);
        try {
            $this->repository->deleteWhere([
                'model_id'      => $model_id,
                'model_type'    => $model_type
            ]);
            return $model_type::findOrFail($model_id);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
    }

    /**
     * Display a listing of the resource for authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myReports(Request $request)
    {
        $limit = $request->limit ? $request->limit : 15;

        return $this->repository->where('user_id', auth()->user()->id)->paginate($limit);
    }
}
