<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'reports-access']);
});

it('renders the insights page for a user with reports access', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('reports-access');

    $this->actingAs($user)
        ->get('/dashboard/reports/insights')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Reports/Insights'));
});

it('redirects guests to login', function () {
    $this->get('/dashboard/reports/insights')
        ->assertRedirect(route('login'));
});
