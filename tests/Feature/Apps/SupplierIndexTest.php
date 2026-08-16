<?php

use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::create(['name' => 'suppliers-access']);
});

function supplierUser(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('suppliers-access');

    return $user;
}

test('suppliers index renders the Inertia page with paginated data', function () {
    Supplier::create([
        'name' => 'PT Maju Jaya',
        'phone' => '081111111111',
        'email' => 'maju@example.com',
        'address' => 'Jakarta',
    ]);

    Supplier::create([
        'name' => 'CV Sejahtera',
        'phone' => '082222222222',
        'email' => 'sejahtera@example.com',
        'address' => 'Bandung',
    ]);

    $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Suppliers/Index')
            ->has('suppliers.data', 2)
            ->has('suppliers.links')
            ->has('suppliers.current_page')
            ->has('suppliers.last_page')
            ->has('suppliers.per_page')
            ->has('suppliers.total')
            ->where('suppliers.total', 2)
            ->has('filters')
        );
});

test('suppliers index search matches by name', function () {
    Supplier::create([
        'name' => 'PT Maju Mundur',
        'phone' => '081234567890',
        'email' => null,
        'address' => null,
    ]);

    Supplier::create([
        'name' => 'CV Toko Sederhana',
        'phone' => '089876543210',
        'email' => null,
        'address' => null,
    ]);

    $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers?search=Maju')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Suppliers/Index')
            ->has('suppliers.data', 1)
            ->where('suppliers.data.0.name', 'PT Maju Mundur')
            ->where('suppliers.total', 1)
        );
});

test('suppliers index search matches by phone', function () {
    Supplier::create([
        'name' => 'Toko Berkah',
        'phone' => '081299887766',
        'email' => null,
        'address' => null,
    ]);

    Supplier::create([
        'name' => 'Toko Baru',
        'phone' => '089900111222',
        'email' => null,
        'address' => null,
    ]);

    $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers?search=998877')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Suppliers/Index')
            ->has('suppliers.data', 1)
            ->where('suppliers.data.0.name', 'Toko Berkah')
            ->where('suppliers.total', 1)
        );
});

test('suppliers index search matches by email', function () {
    Supplier::create([
        'name' => 'Supplier Satu',
        'phone' => null,
        'email' => 'supplier.satu@example.com',
        'address' => null,
    ]);

    Supplier::create([
        'name' => 'Supplier Dua',
        'phone' => null,
        'email' => 'supplier.dua@example.com',
        'address' => null,
    ]);

    $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers?search=supplier.dua')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Suppliers/Index')
            ->has('suppliers.data', 1)
            ->where('suppliers.data.0.name', 'Supplier Dua')
            ->where('suppliers.total', 1)
        );
});

test('suppliers index paginates when more than the page size exist', function () {
    foreach (range(1, 25) as $i) {
        Supplier::create(['name' => "PT Perusahaan $i"]);
    }

    $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Suppliers/Index')
            ->where('suppliers.total', 25)
            ->where('suppliers.last_page', 3)
            ->where('suppliers.per_page', 10)
            ->has('suppliers.data', 10)
        );
});

test('suppliers index keeps search in pagination links', function () {
    foreach (range(1, 25) as $i) {
        Supplier::create(['name' => 'PT Semua Sama']);
    }

    $response = $this->actingAs(supplierUser())
        ->get('/dashboard/suppliers?search=Semua');

    $response->assertOk();

    $links = $response->viewData('page')['props']['suppliers']['links'];
    $pageTwo = collect($links)->firstWhere('label', '2');
    expect($pageTwo)->not->toBeNull();
    expect($pageTwo['url'])->toContain('search=Semua');
});
