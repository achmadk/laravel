<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

test('success flash key from back()->with() reaches the flash prop', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'dashboard-access']);
    $user->givePermissionTo('dashboard-access');

    $this->withSession(['success' => 'Supplier berhasil ditambahkan.'])
        ->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.message', 'Supplier berhasil ditambahkan.')
            ->where('flash.type', 'success')
        );
});

test('error flash key from back()->with() reaches the flash prop as error type', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'dashboard-access']);
    $user->givePermissionTo('dashboard-access');

    $this->withSession(['error' => 'Nominal melebihi sisa hutang.'])
        ->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.message', 'Nominal melebihi sisa hutang.')
            ->where('flash.type', 'error')
        );
});

test('flash() helper convention still maps verbatim and populates data', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'dashboard-access']);
    $user->givePermissionTo('dashboard-access');

    flash('Your account has been successfully deleted.', ['account_id' => 42], 'success');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.message', 'Your account has been successfully deleted.')
            ->where('flash.type', 'success')
            ->where('flash.data', ['account_id' => 42])
        );
});

test('no flash data defaults message to empty and type to success', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'dashboard-access']);
    $user->givePermissionTo('dashboard-access');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.message', null)
            ->where('flash.type', 'success')
        );
});
