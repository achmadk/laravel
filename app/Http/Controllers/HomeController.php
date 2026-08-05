<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $today = Carbon::today();

        $todayTransactions = Transaction::whereDate('created_at', $today)->count();
        $todaySales = Transaction::whereDate('created_at', $today)->sum('grand_total');
        $todayProfit = DB::table('profits')->whereDate('created_at', $today)->sum('total');

        $recentTransactions = Transaction::with('cashier:id,name', 'customer:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'invoice' => $t->invoice,
                'date' => Carbon::parse($t->created_at)->format('d M Y'),
                'customer' => $t->customer?->name ?? '-',
                'total' => $t->grand_total,
            ]);

        $activeShift = CashierShift::query()
            ->open()
            ->where('user_id', $user->id)
            ->first();

        $topProducts = TransactionDetail::select('product_id', DB::raw('SUM(qty) as qty'))
            ->with('product:id,title')
            ->whereDate('transaction_details.created_at', $today)
            ->groupBy('product_id')
            ->orderByDesc('qty')
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'name' => $d->product?->title ?? 'Produk terhapus',
                'qty' => (int) $d->qty,
            ]);

        return Inertia::render('Home', [
            'user' => [
                'name' => $user->name,
                'role' => $user->getRoleNames()->first() ?? 'Staff',
            ],
            'today' => [
                'transactions' => $todayTransactions,
                'sales' => (int) $todaySales,
                'profit' => (int) $todayProfit,
            ],
            'recentTransactions' => $recentTransactions,
            'topProducts' => $topProducts,
            'activeShift' => $activeShift ? [
                'id' => $activeShift->id,
                'opened_at' => $activeShift->opened_at?->toISOString(),
            ] : null,
        ]);
    }
}
