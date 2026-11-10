import { NextResponse } from 'next/server';
import { PRESET_MUSIC_TRACKS } from '@/lib/audio/musicLibrary';

export async function GET() {
  return NextResponse.json({
    success: true,
    tracks: PRESET_MUSIC_TRACKS,
  });
}
