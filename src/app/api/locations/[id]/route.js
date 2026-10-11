import { NextResponse } from 'next/server';
import { queryGet, queryAll } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        
        const location = await queryGet(`SELECT * FROM locations WHERE id = ?`, [id]);
        if (!location) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        
        const sensors = await queryAll(`SELECT * FROM sensors WHERE location_id = ?`, [id]);
        
        return NextResponse.json(
            { location, sensors },
            {
                headers: {
                    'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, max-age=2592000',
                    'Vercel-CDN-Cache-Control': 'public, max-age=2592000',
                }
            }
        );
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
