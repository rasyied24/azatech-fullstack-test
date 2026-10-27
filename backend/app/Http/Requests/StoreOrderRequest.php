<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'uuid', Rule::exists('customers', 'id')->whereNull('deleted_at')],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.exists' => 'Pelanggan tidak ditemukan',
            'items.required' => 'Order harus berisi minimal satu produk',
            'items.min' => 'Order harus berisi minimal satu produk',
            'items.*.product_id.distinct' => 'Produk tidak boleh duplikat dalam satu order',
            'items.*.product_id.exists' => 'Produk tidak ditemukan',
            'items.*.quantity.min' => 'Jumlah minimal 1',
        ];
    }
}
