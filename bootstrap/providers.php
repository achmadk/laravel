<?php

use App\Providers\AppServiceProvider;
use Barryvdh\DomPDF\ServiceProvider;
use Spatie\Permission\PermissionServiceProvider;

return [
    AppServiceProvider::class,
    ServiceProvider::class,
    PermissionServiceProvider::class,
];
