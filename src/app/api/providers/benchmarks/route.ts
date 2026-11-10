import { NextResponse } from 'next/server';
import { getProviderBenchmarks } from '@/lib/providers/registry';

export async function GET() {
  return NextResponse.json({
    success: true,
    benchmarks: getProviderBenchmarks(),
  });
}
