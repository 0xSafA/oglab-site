<?php

namespace oglab\Database\Repositories;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use oglab\Database\Models\User;
use Prettus\Validator\Exceptions\ValidatorException;
use Spatie\Permission\Models\Permission;
use oglab\Enums\Permission as UserPermission;
use Prettus\Repository\Criteria\RequestCriteria;
use Prettus\Repository\Exceptions\RepositoryException;
use oglab\Mail\ForgetPassword;
use Illuminate\Support\Facades\Mail;
use oglab\Database\Models\Address;
use oglab\Database\Models\Profile;
use oglab\Database\Models\Settings;
use oglab\Database\Models\Shop;
use oglab\Exceptions\oglabException;

class UserRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name' => 'like',
        'email' => 'like',
    ];

    /**
     * @var array
     */
    protected $dataArray = [
        'name',
        'email',
        'shop_id'
    ];

    /**
     * Configure the Model
     **/
    public function model()
    {
        return User::class;
    }

    public function boot()
    {
        try {
            $this->pushCriteria(app(RequestCriteria::class));
        } catch (RepositoryException $e) {
        }
    }

    public function storeUser($request)
    {
        try {
            $user = $this->create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);
            $user->givePermissionTo(UserPermission::CUSTOMER);
            if (isset($request['address']) && count($request['address'])) {
                $user->address()->createMany($request['address']);
            }
            if (isset($request['profile'])) {
                $user->profile()->create($request['profile']);
            }
            $user->profile = $user->profile;
            $user->address = $user->address;
            $user->shop = $user->shop;
            $user->managed_shop = $user->managed_shop;
            return $user;
        } catch (ValidatorException $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    public function updateUser($request, $user)
    {
        try {
            if (isset($request['address']) && count($request['address'])) {
                foreach ($request['address'] as $address) {
                    if (isset($address['id'])) {
                        Address::findOrFail($address['id'])->update($address);
                    } else {
                        $address['customer_id'] = $user->id;
                        Address::create($address);
                    }
                }
            }

            if (isset($request['profile'])) {
                if (isset($request['profile']['id'])) {
                    Profile::findOrFail($request['profile']['id'])->update($request['profile']);
                } else {
                    $profile = $request['profile'];
                    $profile['customer_id'] = $user->id;
                    Profile::create($profile);
                }
            }
            $user->update($request->only($this->dataArray));
            $user->profile = $user->profile;
            $user->address = $user->address;
            $user->shop = $user->shop;
            $user->managed_shop = $user->managed_shop;
            return $user;
        } catch (ValidationException $e) {
            throw new oglabException(SOMETHING_WENT_WRONG);
        }
    }

    public function sendResetEmail($email, $token)
    {
        try {
            Mail::to($email)->send(new ForgetPassword($token));
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    /**
     * Update user email and send verification link to the user.
     * @param  $request
     * @return string[]
     */

    public function updateEmail($request): array
    {
        $user = $request->user();
        $user->email = $request->email;
        $user->email_verified_at = null;
        $user->save();
        $user->sendEmailVerificationNotification();
        return ['message' => EMAIL_UPDATED_SUCCESSFULLY, 'status' => 'success'];
    }

    public function checkIfApplicationIsValid(): bool
    {
        $settings = Settings::getData();
        $useMustVerifyLicense = isset($settings->options['app_settings']['trust']) ? $settings->options['app_settings']['trust'] : false;
        return $useMustVerifyLicense;
    }
}
