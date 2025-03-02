<?php

namespace oglab\Http\Controllers;

use oglab\Exceptions\oglabException;
use oglab\Facades\Ai;
use oglab\Http\Requests\AiDescriptionRequest;

class AiController extends CoreController
{

    public function generateDescription(AiDescriptionRequest $request): mixed
    {
        try {
            return Ai::generateDescription($request);
        } catch (oglabException $e) {
            throw new oglabException(SOMETHING_WENT_WRONG, $e->getMessage());
        }
    }
}
