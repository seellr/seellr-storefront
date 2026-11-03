import { NextRequest, NextResponse } from 'next/server'
import { forwardCommerce } from '@/lib/commerce/proxy'

export async function POST(request: NextRequest) {
  const response = await forwardCommerce(request, 'customer', ['auth', 'logout'])
  const output = new NextResponse(response.body, { status: response.status, headers: response.headers })
  output.cookies.delete('customer_token')
  return output
}
