import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { sensorId } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 1000;
        const groupBy = searchParams.get('groupBy') || 'none'; // 'none', 'daily', 'monthly'
        
        let measurements;
        if (groupBy === 'daily') {
            measurements = await queryAll(`
                SELECT date(utc_time) as utc_time, AVG(value) as value, MIN(value) as min_val, MAX(value) as max_val 
                FROM measurements 
                WHERE sensor_id = ? 
                GROUP BY date(utc_time) 
                ORDER BY utc_time DESC 
                LIMIT ?
            `, [sensorId, limit]);
        } else if (groupBy === 'monthly') {
            measurements = await queryAll(`
                SELECT strftime('%Y-%m', utc_time) || '-01' as utc_time, AVG(value) as value, MIN(value) as min_val, MAX(value) as max_val 
                FROM measurements 
                WHERE sensor_id = ? 
                GROUP BY strftime('%Y-%m', utc_time) 
                ORDER BY utc_time DESC 
                LIMIT ?
            `, [sensorId, limit]);
        } else {
            measurements = await queryAll(`
                SELECT utc_time, local_time, value 
                FROM measurements 
                WHERE sensor_id = ? 
                ORDER BY utc_time DESC 
                LIMIT ?
            `, [sensorId, limit]);
        }
        
        return NextResponse.json(
            measurements,
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
