import { NextRequest } from 'next/server'
import { forwardCommerce } from '@/lib/commerce/proxy'
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return forwardCommerce(request, 'customer', (await context.params).path) }
export const GET = handler; export const POST = handler; export const DELETE = handler; export const PUT = handler; export const PATCH = handler
