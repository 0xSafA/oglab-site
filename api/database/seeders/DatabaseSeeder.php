<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use oglab\Database\Models\Attribute;
use oglab\Database\Models\AttributeValue;
use oglab\Database\Models\Product;
use oglab\Database\Models\User;
use oglab\Database\Models\Category;
use oglab\Database\Models\Type;
use oglab\Database\Models\Order;
use oglab\Database\Models\OrderStatus;
use oglab\Database\Models\Coupon;
use Spatie\Permission\Models\Permission;
use oglab\Enums\Permission as UserPermission;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // run your app seeder
    }
}
