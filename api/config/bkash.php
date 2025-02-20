<?php

/*
 * This file is part of the Laravel bkash package.
 *
 * (c) Prosper Otemuyiwa <prosperotemuyiwa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return [

    "sandbox"         => env("BKASH_SANDBOX", true),
    "bkash_app_key"     => env("BKASH_APP_KEY", ""),
    "bkash_app_secret" => env("BKASH_APP_SECRET", ""),
    "bkash_username"      => env("BKASH_USERNAME", ""),
    "bkash_password"     => env("BKASH_PASSWORD", ""),
    "callbackURL"     => env("BKASH_CALLBACK_URL", "http://127.0.0.1:8000/bkash/callback"),
    'timezone'        => 'Asia/Dhaka',

];
