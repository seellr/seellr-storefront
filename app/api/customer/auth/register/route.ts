import { NextRequest, NextResponse } from 'next/server'
import { forwardCommerce } from '@/lib/commerce/proxy'
import { registerSchema } from '@/lib/commerce/schemas'

export async function POST(request: NextRequest) {
  const body = await request.clone().json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error_code: 'validation_failed', errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  return forwardCommerce(request, 'customer', ['auth', 'register'])
}
