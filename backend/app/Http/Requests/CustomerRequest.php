<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_address' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['Pria', 'Wanita'])],
            'birth_date' => ['required', 'date_format:Y-m-d', 'before:today'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^\+?[0-9]{8,19}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'gender.in' => 'Gender harus Pria atau Wanita',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini',
            'phone.regex' => 'No. HP hanya boleh berisi angka (boleh diawali +), 8 sampai 19 digit',
        ];
    }
}
