<?php

use App\Models\Cart;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Permission;

function clearCartUser(): User
{
    Permission::findOrCreate('transactions-access', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('transactions-access');

    CashierShift::create([
        'user_id' => $user->id,
        'opened_by' => $user->id,
        'opened_at' => now(),
        'opening_cash' => 0,
        'status' => CashierShift::STATUS_OPEN,
    ]);

    return $user;
}

function clearCartProduct(): Product
{
    $category = Category::create([
        'image' => 'cat.png',
        'name' => 'Kategori',
        'description' => 'Kategori uji',
    ]);

    return Product::create([
        'category_id' => $category->id,
        'image' => 'product.png',
        'barcode' => 'CC-'.fake()->unique()->numerify('######'),
        'title' => 'Produk Uji',
        'description' => 'Produk uji',
        'buy_price' => 3000,
        'sell_price' => 5000,
        'stock' => 10,
    ]);
}

test('clears active cart items for the current cashier', function () {
    $user = clearCartUser();
    $product = clearCartProduct();

    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => 5000,
    ]);
    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 2,
        'price' => 10000,
    ]);

    expect(Cart::where('cashier_id', $user->id)->count())->toBe(2);

    $this->actingAs($user)
        ->delete('/dashboard/transactions/cart')
        ->assertSessionHasNoErrors();

    expect(Cart::where('cashier_id', $user->id)->count())->toBe(0);
});

test('does not clear held carts', function () {
    $user = clearCartUser();
    $product = clearCartProduct();

    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => 5000,
        'hold_id' => 1,
        'hold_label' => 'Meja 1',
        'held_at' => now(),
    ]);
    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => 5000,
    ]);

    $this->actingAs($user)
        ->delete('/dashboard/transactions/cart')
        ->assertSessionHasNoErrors();

    expect(Cart::where('cashier_id', $user->id)->held()->count())->toBe(1);
    expect(Cart::where('cashier_id', $user->id)->active()->count())->toBe(0);
});

test('does not clear other cashiers carts', function () {
    $user = clearCartUser();
    $other = clearCartUser();
    $product = clearCartProduct();

    Cart::create([
        'cashier_id' => $other->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => 5000,
    ]);

    $this->actingAs($user)
        ->delete('/dashboard/transactions/cart')
        ->assertSessionHasNoErrors();

    expect(Cart::where('cashier_id', $other->id)->count())->toBe(1);
});

test('guests are redirected to login', function () {
    $this->delete('/dashboard/transactions/cart')->assertRedirect(route('login'));
});
