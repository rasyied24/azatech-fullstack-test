<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
            'product_code' => [
                'required', 'string', 'max:20',
                Rule::unique('products', 'product_code')->ignore($this->route('product')),
            ],
            'product_name' => ['required', 'string', 'max:150'],
            'stock' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:9999999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_code.unique' => 'Kode produk sudah digunakan',
            'stock.min' => 'Stok tidak boleh negatif',
            'price.gt' => 'Harga harus lebih dari 0',
        ];
    }
}
