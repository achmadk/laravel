<?php

namespace App\Http\Middleware;

use App\Http\Resources\AuthenticatedUserResource;
use App\Models\Payable;
use App\Models\Product;
use App\Models\Receivable;
use App\Services\CashierShiftService;
use App\Services\PayableAgingService;
use App\Services\ReceivableService;
use App\Support\ProductionSecurityBaseline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $lowStockNotifications = [];
        $receivableNotifications = [];
        $payableNotifications = [];
        $activeCashierShift = null;
        $securityWarnings = [];
        $stepUpFreshUntil = null;
        $payableAgingSummary = null;
        $receivableAgingSummary = null;

        if ($request->user()) {
            $userId = $request->user()->id;

            $lowStockNotifications = Product::where('stock', '<=', 0)
                ->whereNotExists(function ($query) use ($userId) {
                    $query->selectRaw('1')
                        ->from('product_notification_reads as pr')
                        ->whereColumn('pr.product_id', 'products.id')
                        ->where('pr.user_id', $userId)
                        ->whereColumn('pr.updated_at', '>=', 'products.updated_at');
                })
                ->orderByDesc('updated_at')
                ->limit(10)
                ->get(['id', 'title', 'stock', 'updated_at'])
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'title' => $product->title,
                        'stock' => (int) $product->stock,
                        'time' => optional($product->updated_at)->diffForHumans(),
                    ];
                });

            $payableAgingService = new PayableAgingService;
            $receivableService = new ReceivableService;

            $payableAgingSummary = $payableAgingService->getAgingSummary();
            $receivableAgingSummary = $receivableService->getAgingSummary();

            $receivableNotifications = Receivable::whereNot('status', 'paid')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<=', now()->addDays(3))
                ->orderBy('due_date')
                ->limit(5)
                ->get(['id', 'invoice', 'customer_id', 'due_date', 'total', 'paid', 'status'])
                ->map(function ($item) {
                    $remaining = max(0, ($item->total ?? 0) - ($item->paid ?? 0));

                    return [
                        'id' => $item->id,
                        'title' => "Piutang: {$item->invoice}",
                        'customer_id' => $item->customer_id,
                        'due_date' => optional($item->due_date)->format('Y-m-d'),
                        'remaining' => $remaining,
                        'status' => $item->status,
                        'time' => optional($item->due_date)->diffForHumans(),
                    ];
                });

            $payableNotifications = Payable::whereNot('status', 'paid')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<=', now()->addDays(3))
                ->orderBy('due_date')
                ->limit(5)
                ->get(['id', 'document_number', 'supplier_id', 'due_date', 'total', 'paid', 'status'])
                ->map(function ($item) {
                    $remaining = max(0, ($item->total ?? 0) - ($item->paid ?? 0));

                    return [
                        'id' => $item->id,
                        'title' => "Hutang: {$item->document_number}",
                        'supplier_id' => $item->supplier_id,
                        'due_date' => optional($item->due_date)->format('Y-m-d'),
                        'remaining' => $remaining,
                        'status' => $item->status,
                        'time' => optional($item->due_date)->diffForHumans(),
                    ];
                });

            $securityWarnings = [];
            if (class_exists(ProductionSecurityBaseline::class)) {
                $securityWarnings = ProductionSecurityBaseline::issues();
            }

            $activeCashierShift = null;
            if (Schema::hasTable('cashier_shifts')) {
                $cashierShiftService = new CashierShiftService;
                $activeCashierShift = $cashierShiftService->getActiveShiftForUser($request->user()->id);

                if ($activeCashierShift) {
                    $activeCashierShift = [
                        'id' => $activeCashierShift->id,
                        'opened_at' => $activeCashierShift->opened_at?->format('Y-m-d H:i:s'),
                        'opening_balance' => $activeCashierShift->opening_balance,
                    ];
                }
            }

            $stepUpFreshUntil = $request->session()->get('auth.password_confirmed_at');
            if ($stepUpFreshUntil) {
                $stepUpFreshUntil = $stepUpFreshUntil + (config('auth.password_timeout', 900) * 60);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? AuthenticatedUserResource::make($request->user()) : null,
                'super' => $request->user()?->isSuperAdmin() ?? false,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => fn () => [
                'message' => $request->session()->get('message')
                    ?? $request->session()->get('success')
                    ?? $request->session()->get('error'),
                'type' => $request->session()->get('type')
                    ?? ($request->session()->has('error') ? 'error' : 'success'),
                'data' => $request->session()->get('data'),
            ],
            'notifications' => [
                'low_stock' => $lowStockNotifications,
                'receivables' => $receivableNotifications,
                'payables' => $payableNotifications,
            ],
            'cashierShift' => $activeCashierShift,
            'securityWarnings' => $securityWarnings,
            'stepUpFreshUntil' => $stepUpFreshUntil,
            'agingSummary' => [
                'payable' => $payableAgingSummary,
                'receivable' => $receivableAgingSummary,
            ],
            'permissions' => $request->user()?->getPermissions()?->toArray() ?? [],
        ];
    }
}
