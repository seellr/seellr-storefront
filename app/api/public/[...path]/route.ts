import { NextRequest } from 'next/server'
import { forwardCommerce } from '@/lib/commerce/proxy'
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return forwardCommerce(request, 'public', (await context.params).path) }
export const GET = handler; export const POST = handler
