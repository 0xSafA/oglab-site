<?php


namespace oglab\Database\Repositories;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use oglab\Database\Models\Balance;
use oglab\Database\Models\OwnershipTransfer;
use oglab\Database\Models\Product;
use oglab\Database\Models\Shop;
use oglab\Database\Models\User;
use oglab\Enums\DefaultStatusType;
use oglab\Enums\Permission;
use oglab\Enums\ProductVisibilityStatus;
use oglab\Events\ProcessOwnershipTransition;
use oglab\Events\ShopMaintenance;
use oglab\Http\Requests\TransferShopOwnerShipRequest;
use Prettus\Repository\Criteria\RequestCriteria;
use Prettus\Repository\Exceptions\RepositoryException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ShopRepository extends BaseRepository
{

    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name'        => 'like',
        'is_active',
        'categories.slug',
        'users.name'
    ];

    /**
     * @var array
     */
    protected $dataArray = [
        'name',
        'slug',
        'description',
        'cover_image',
        'logo',
        'is_active',
        'address',
        'settings',
        'notifications',
    ];


    public function boot()
    {
        try {
            $this->pushCriteria(app(RequestCriteria::class));
        } catch (RepositoryException $e) {
            //
        }
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return Shop::class;
    }

    public function storeShop($request)
    {
        try {
            $data = $request->only($this->dataArray);
            $data['slug'] = $this->makeSlug($request);
            $data['owner_id'] = $request->user()->id;
            $shop = $this->create($data);
            if (isset($request['categories'])) {
                $shop->categories()->attach($request['categories']);
            }
            if (isset($request['balance']['payment_info'])) {
                $shop->balance()->create($request['balance']);
            }

            // TODO : why this code is needed
            // $shop->categories = $shop->categories;
            // $shop->staffs = $shop->staffs;
            return $shop;
        } catch (Exception $e) {
            throw new HttpException(400, COULD_NOT_CREATE_THE_RESOURCE);
        }
    }

    public function updateShop($request, $id)
    {
        try {
            $shop = $this->findOrFail($id);
            if (isset($request['categories'])) {
                $shop->categories()->sync($request['categories']);
            }
            if (isset($request['balance'])) {
                if (isset($request['balance']['admin_commission_rate']) && $shop->balance->admin_commission_rate !== $request['balance']['admin_commission_rate']) {
                    if ($request->user()->hasPermissionTo(Permission::SUPER_ADMIN)) {
                        $this->updateBalance($request['balance'], $id);
                    }
                } else {
                    $this->updateBalance($request['balance'], $id);
                }
            }
            $data = $request->only($this->dataArray);
            if (!empty($request->slug) &&  $request->slug != $shop['slug']) {
                $data['slug'] = $this->makeSlug($request);
            }
            $shop->update($data);

            // TODO : why this code is needed
            // $shop->categories = $shop->categories;
            // $shop->staffs = $shop->staffs;
            // $shop->balance = $shop->balance;


            // 1. Shop owner maintenance time set korbe.. then ekta event fire hobe jeita shop notifications (email, sms) send korbe super-admin, vendor, staff, oi specific shop er front-end a ekta notice dekhabe with countdown.
            // 2. countDown start er 1 day ago or 6 hours ago ekta final email/sms dibe vendor, staff k 
            // 3. countdown onStart a sob product private
            // 4. countdown onComplete a sob product public

            if (isset($request['settings']['isShopUnderMaintenance'])) {
                if ($request['settings']['isShopUnderMaintenance']) {
                    event(new ShopMaintenance($shop, 'enable'));
                } else {
                    event(new ShopMaintenance($shop, 'disable'));
                }
            }

            return $shop;
        } catch (Exception $e) {
            throw new HttpException(400, COULD_NOT_UPDATE_THE_RESOURCE);
        }
    }

    public function maintenanceShopEvent($request, $id)
    {
        $shop = $this->findOrFail($id);
        if ($request['isShopUnderMaintenance'] && $request['isMaintenance']) {
            Product::where('shop_id', '=', $id)->update(['visibility' => ProductVisibilityStatus::VISIBILITY_PRIVATE]);
            event(new ShopMaintenance($shop, 'start'));
        } else {
            Product::where('shop_id', '=', $id)->update(['visibility' => ProductVisibilityStatus::VISIBILITY_PUBLIC]);
            event(new ShopMaintenance($shop, 'disable'));
        }
    }

    public function updateBalance($balance, $shop_id)
    {
        if (isset($balance['id'])) {
            Balance::findOrFail($balance['id'])->update($balance);
        } else {
            $balance['shop_id'] = $shop_id;
            Balance::create($balance);
        }
    }

    public function transferShopOwnership(TransferShopOwnerShipRequest $request)
    {
        $user = $request->user();
        $shopId = $request->shop_id ?? null;

        if (!$this->hasPermission($user, $shopId)) {
            throw new AuthorizationException(NOT_AUTHORIZED);
        }

        $shop = $this->findOrFail($shopId);
        $previousOwner = $shop->owner;

        $newOwnerId = $request->vendor_id;
        $newOwner = User::findOrFail($newOwnerId);

        OwnershipTransfer::updateOrCreate(
            [
                "shop_id"    => $shopId,
            ],
            [
                "from"       => $previousOwner->id,
                "message"    => $request?->message,
                "to"         => $newOwnerId,
                "created_by" => $user->id,
                "status"     => DefaultStatusType::PENDING,
            ]
        );

        $optional = [
            'message' =>  $request?->vendorMessage,
        ];

        event(new ProcessOwnershipTransition($shop, $previousOwner, $newOwner, $optional));

        return $shop;
    }
}
