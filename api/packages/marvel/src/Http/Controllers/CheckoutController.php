<?php

namespace oglab\Http\Controllers;

use oglab\Database\Repositories\CheckoutRepository;
use oglab\Exceptions\oglabException;
use oglab\Http\Requests\CheckoutVerifyRequest;

class CheckoutController extends CoreController
{
    public $repository;

    public function __construct(CheckoutRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Verify the checkout data and calculate tax and shipping.
     *
     * @param CheckoutVerifyRequest $request
     * @return array
     */
    public function verify(CheckoutVerifyRequest $request)
    {
        try {
            return $this->repository->verify($request);
        } catch (oglabException $th) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }
}
