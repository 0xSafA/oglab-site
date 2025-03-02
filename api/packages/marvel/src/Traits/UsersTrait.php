<?php

namespace oglab\Traits;

use Illuminate\Support\Facades\Cache;
use oglab\Enums\Permission;
use oglab\Database\Models\User;

trait UsersTrait
{
    public function getAdminUsers()
    {
        return  Cache::remember(
            'cached_admin',
            900,
            fn () => User::with('profile')->where('is_active', true)->permission(Permission::SUPER_ADMIN)->get()
        );
    }
}
