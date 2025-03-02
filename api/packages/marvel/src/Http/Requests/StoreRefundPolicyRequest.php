<?php

namespace oglab\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use oglab\Database\Models\Shop;
use oglab\Enums\RefundPolicyStatus;
use oglab\Enums\RefundPolicyTarget;

class StoreRefundPolicyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title'       => ['required', 'string', 'max: 255'],
            'target'      => ['required', ],
            'status'      => ['required',],
            'slug'        => ['nullable', 'string', 'max: 255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'shop_id'     => ['nullable', 'exists: ' . Shop::class . ',id'],
            'language'    => ['nullable', 'string'],
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
}
