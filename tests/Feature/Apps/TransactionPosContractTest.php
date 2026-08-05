<?php

use App\Models\Cart;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

function posUser(bool $withShift = true): User
{
    foreach (['transactions-access', 'transactions-confirm-payment'] as $name) {
        Permission::findOrCreate($name, 'web');
    }

    $user = User::factory()->create();
    $user->givePermissionTo('transactions-access');

    if ($withShift) {
        CashierShift::create([
            'user_id' => $user->id,
            'opened_by' => $user->id,
            'opened_at' => now(),
            'opening_cash' => 0,
            'status' => CashierShift::STATUS_OPEN,
        ]);
    }

    return $user;
}

function posProduct(int $stock = 10, int $sellPrice = 5000): Product
{
    $category = Category::create([
        'image' => 'cat.png',
        'name' => 'Kategori',
        'description' => 'Kategori uji',
    ]);

    return Product::create([
        'category_id' => $category->id,
        'image' => 'product.png',
        'barcode' => 'BRC-'.fake()->unique()->numerify('######'),
        'title' => 'Produk Uji',
        'description' => 'Produk uji',
        'buy_price' => 3000,
        'sell_price' => $sellPrice,
        'stock' => $stock,
    ]);
}

test('index renders with carts prop populated for active cart items', function () {
    $user = posUser();
    $product = posProduct();

    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 2,
        'price' => 2 * $product->sell_price,
    ]);

    $this->actingAs($user)
        ->get('/dashboard/transactions')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Transactions/Index')
            ->has('carts', 1)
            ->where('carts.0.qty', 2)
            ->has('initialPricingPreview')
            ->has('shiftSummary')
        );
});

test('addToCart redirects and persists the cart item', function () {
    $user = posUser();
    $product = posProduct();

    $this->actingAs($user)
        ->post('/dashboard/transactions/addToCart', [
            'product_id' => $product->id,
            'sell_price' => $product->sell_price,
            'qty' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('carts', [
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
    ]);
});

test('updateCart redirects and updates quantity', function () {
    $user = posUser();
    $product = posProduct();
    $cart = Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => $product->sell_price,
    ]);

    $this->actingAs($user)
        ->patch("/dashboard/transactions/{$cart->id}/updateCart", ['qty' => 3])
        ->assertRedirect();

    $this->assertDatabaseHas('carts', [
        'id' => $cart->id,
        'qty' => 3,
        'price' => 3 * $product->sell_price,
    ]);
});

test('destroyCart redirects and removes the item', function () {
    $user = posUser();
    $product = posProduct();
    $cart = Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 1,
        'price' => $product->sell_price,
    ]);

    $this->actingAs($user)
        ->delete("/dashboard/transactions/{$cart->id}/destroyCart")
        ->assertRedirect();

    $this->assertDatabaseMissing('carts', ['id' => $cart->id]);
});

test('cart mutations require an active shift', function () {
    $user = posUser(withShift: false);
    $product = posProduct();

    $this->actingAs($user)
        ->post('/dashboard/transactions/addToCart', [
            'product_id' => $product->id,
            'sell_price' => $product->sell_price,
            'qty' => 1,
        ])
        ->assertRedirect('/dashboard/transactions');

    $this->assertDatabaseMissing('carts', [
        'cashier_id' => $user->id,
        'product_id' => $product->id,
    ]);
});

test('checkout via store redirects to the print route', function () {
    $user = posUser();
    $product = posProduct(stock: 5, sellPrice: 5000);

    Cart::create([
        'cashier_id' => $user->id,
        'product_id' => $product->id,
        'qty' => 2,
        'price' => 2 * $product->sell_price,
    ]);

    $response = $this->actingAs($user)
        ->post('/dashboard/transactions/store', [
            'customer_id' => null,
            'payment_gateway' => null,
            'cash' => 10000,
            'pay_later' => false,
            'discount' => 0,
            'shipping_cost' => 0,
            'redeem_points' => 0,
        ]);

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('/print');

    $this->assertDatabaseHas('transactions', [
        'cashier_id' => $user->id,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
    ]);
    $this->assertDatabaseMissing('carts', [
        'cashier_id' => $user->id,
        'hold_id' => null,
    ]);
});
