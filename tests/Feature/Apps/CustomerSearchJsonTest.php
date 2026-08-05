<?php

use App\Models\Customer;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::create(['name' => 'customers-access']);
    Permission::create(['name' => 'customers-create']);
    Permission::create(['name' => 'transactions-access']);
});

function customerUser(): User
{
    $cashierRole = Role::create(['name' => 'cashier']);
    $cashierRole->givePermissionTo(['customers-access', 'customers-create', 'transactions-access']);

    $user = User::factory()->create();
    $user->assignRole('cashier');

    return $user;
}

test('customers index with Accept json and no X-Inertia returns JSON array', function () {
    $user = customerUser();

    Customer::create([
        'name' => 'Alice',
        'no_telp' => '081234567890',
        'address' => 'Alamat Alice',
    ]);

    Customer::create([
        'name' => 'Bob',
        'no_telp' => '089876543210',
        'address' => 'Alamat Bob',
    ]);

    $response = $this->actingAs($user)
        ->withHeaders(['Accept' => 'application/json'])
        ->get('/dashboard/customers');

    $response->assertOk();
    $response->assertJsonStructure([
        '*' => ['id', 'name', 'no_telp', 'address'],
    ]);
    expect($response->json())->toBeArray();
    expect(count($response->json()))->toBeGreaterThanOrEqual(2);
});

test('customers index as a normal navigation still renders the Inertia page', function () {
    $user = customerUser();

    Customer::create([
        'name' => 'Carol',
        'no_telp' => '081122334455',
        'address' => 'Alamat Carol',
    ]);

    // A plain navigation (default Accept, no X-Inertia) must render the page,
    // not hit the JSON branch.
    $this->actingAs($user)
        ->get('/dashboard/customers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Customers/Index')
            ->has('customers.data')
        );
});

test('JSON search matches by phone no_telp', function () {
    $user = customerUser();

    Customer::create([
        'name' => 'Diana',
        'no_telp' => '085512345678',
        'address' => 'Alamat Diana',
    ]);

    Customer::create([
        'name' => 'Eve',
        'no_telp' => '089998887777',
        'address' => 'Alamat Eve',
    ]);

    $response = $this->actingAs($user)
        ->withHeaders(['Accept' => 'application/json'])
        ->get('/dashboard/customers?search=85512345678');

    $response->assertOk();
    $data = $response->json();
    expect($data)->toBeArray();
    expect(count($data))->toBe(1);
    expect($data[0]['name'])->toBe('Diana');
});

test('transactions index sends an empty customers prop', function () {
    Permission::create(['name' => 'dashboard-access']);
    $user = customerUser();
    $user->givePermissionTo('dashboard-access');

    Customer::create([
        'name' => 'Frank',
        'no_telp' => '081299887766',
        'address' => 'Alamat Frank',
    ]);

    $this->actingAs($user)
        ->get('/dashboard/transactions')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Transactions/Index')
            ->where('customers', [])
        );
});

test('cashier role user is authorized for JSON search and storeAjax', function () {
    $user = customerUser();

    // JSON search is authorized (customers-access)
    $searchResponse = $this->actingAs($user)
        ->withHeaders(['Accept' => 'application/json'])
        ->get('/dashboard/customers?search=test');

    $searchResponse->assertOk();

    // storeAjax is authorized (customers-create)
    $createResponse = $this->actingAs($user)
        ->post('/dashboard/customers/store-ajax', [
            'name' => 'NewCustomer',
            'no_telp' => '081999888777',
            'address' => 'Alamat NewCustomer',
        ]);

    $createResponse->assertOk();
    $this->assertDatabaseHas('customers', [
        'name' => 'NewCustomer',
        'no_telp' => '081999888777',
    ]);
});
