<?php


namespace oglab\Http\Controllers;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use oglab\Database\Models\Question;
use oglab\Database\Models\Settings;
use oglab\Database\Repositories\QuestionRepository;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\QuestionCreateRequest;
use oglab\Http\Requests\QuestionUpdateRequest;
use Symfony\Component\HttpKernel\Exception\HttpException;

class QuestionController extends CoreController
{
    public $repository;

    public function __construct(QuestionRepository $repository)
    {
        $this->repository = $repository;
    }


    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Collection|Question[]
     */
    public function index(Request $request)
    {
        $limit = $request->limit ? $request->limit : 15;
        $productId = $request['product_id'];

        if (isset($productId) && !empty($productId)) {
            if (null !== $request->user()) {
                $request->user()->id;
            }
            return $this->repository->where([
                ['product_id', '=', $productId],
                ['answer', '!=', null]
            ])->paginate($limit);
        }
        if (isset($request['answer']) && $request['answer'] === 'null') {
            return $this->repository->paginate($limit);
        }
        return $this->repository->where('answer', '!=', null)->paginate($limit);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  QuestionCreateRequest  $request
     * @return mixed
     * @throws Exception
     */
    public function store(QuestionCreateRequest $request): Question
    {
        try {
            $productQuestionCount = $this->repository->where([
                'product_id' => $request['product_id'],
                'user_id'    => $request->user()->id,
                'shop_id'    => $request['shop_id']
            ])->count();

            $settings = Settings::getData();
            $maximumQuestionLimit = isset($settings['options']['maximumQuestionLimit']) ? $settings['options']['maximumQuestionLimit'] : 5;

            if ($maximumQuestionLimit <= $productQuestionCount) {
                throw new HttpException(400, MAXIMUM_QUESTION_LIMIT_EXCEEDED);
            }

            return $this->repository->storeQuestion($request);
        } catch (oglabException $e) {
            throw new oglabException(MAXIMUM_QUESTION_LIMIT_EXCEEDED);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param $id
     * @return JsonResponse
     */
    public function show($id)
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (oglabException $e) {
            throw new oglabException(NOT_FOUND);
        }
    }

    public function update(QuestionUpdateRequest $request, $id)
    {
        $request->id = $id;
        return $this->updateQuestion($request, $id);
    }

    public function updateQuestion(Request $request)
    {
        try {
            if ($this->repository->hasPermission($request->user(), $request->shop_id)) {
                $id = $request->id;
                return $this->repository->updateQuestion($request, $id);
            }
            throw new AuthorizationException(NOT_AUTHORIZED);
        } catch (oglabException $th) {
            throw new oglabException(COULD_NOT_UPDATE_THE_RESOURCE);
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

    /**
     * Display a listing of the resource for authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myQuestions(Request $request)
    {
        $limit = $request->limit ? $request->limit : 15;

        return $this->repository->where('user_id', auth()->user()->id)->with('product')->paginate($limit);
    }
}
