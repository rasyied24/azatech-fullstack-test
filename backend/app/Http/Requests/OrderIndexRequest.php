<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrderIndexRequest extends FormRequest
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
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'customer_id' => ['nullable', 'uuid'],
        ];
    }

    public function messages(): array
    {
        return [
            'from.date_format' => 'Format tanggal harus YYYY-MM-DD',
            'to.date_format' => 'Format tanggal harus YYYY-MM-DD',
            'to.after_or_equal' => 'Tanggal akhir tidak boleh sebelum tanggal awal',
        ];
    }
}
