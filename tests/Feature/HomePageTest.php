<?php

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get('/home')->assertRedirect('/login');
});

test('home page renders recent transactions with d M Y dates', function () {
    $user = User::factory()->create();
    $cashier = User::factory()->create();

    $transaction = Transaction::create([
        'cashier_id' => $cashier->id,
        'invoice' => 'INV-001',
        'cash' => 100000,
        'change' => 0,
        'discount' => 0,
        'grand_total' => 100000,
    ]);

    $this->actingAs($user)
        ->get('/home')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->has('recentTransactions', 1)
            ->where('recentTransactions.0.invoice', 'INV-001')
            ->where('recentTransactions.0.date', Carbon::parse($transaction->created_at)->format('d M Y')));
});

test('home page renders with an empty recent transactions list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/home')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->has('recentTransactions', 0));
});
