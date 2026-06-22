<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'dashboard-access']);
    $user->givePermissionTo('dashboard-access');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Dashboard/Index'));
});
