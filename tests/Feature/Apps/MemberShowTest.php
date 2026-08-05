<?php

use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

test('member show returns ISO-8601 transaction dates', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'customers-access']);
    $user->givePermissionTo('customers-access');

    $customer = Customer::create([
        'name' => 'Budi Santoso',
        'no_telp' => 81234567890,
        'address' => 'Jl. Merdeka No. 1',
    ]);

    $transaction = Transaction::create([
        'cashier_id' => $user->id,
        'customer_id' => $customer->id,
        'invoice' => 'INV-002',
        'cash' => 50000,
        'change' => 0,
        'discount' => 0,
        'grand_total' => 50000,
    ]);

    $this->actingAs($user)
        ->get(route('members.show', $customer))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Members/Show')
            ->has('recentTransactions', 1)
            ->where('recentTransactions.0.date', Carbon::parse($transaction->created_at)->toISOString()));
});
