<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, CreateOrderAction $action): JsonResponse
    {
        $order = $action->execute(
            $request->user(),
            $request->validated('customer_id'),
            $request->validated('items'),
        );

        return ApiResponse::success(new OrderResource($order), 'Order berhasil dibuat', 201);
    }
}