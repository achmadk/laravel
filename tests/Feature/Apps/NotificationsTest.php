<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('renders the notifications page for an authenticated user', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/notifications')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Notifications/Index')
            ->has('notifications.low_stock')
            ->has('notifications.receivables')
            ->has('notifications.payables'));
});

it('redirects guests away from the notifications page', function () {
    $this->get('/dashboard/notifications')
        ->assertRedirect(route('login'));
});
