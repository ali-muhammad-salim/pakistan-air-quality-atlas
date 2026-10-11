import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    try {
        const sensors = await queryAll('SELECT parameter, MAX(units) as units FROM sensors WHERE location_id = ? GROUP BY parameter', [id]);
        if (sensors.length === 0) {
            return NextResponse.json({ data: [], parameters: [] });
        }
        const parameters = sensors.map(s => s.parameter);
        
        let timeFilter = '';
        if (range === '7d') {
            timeFilter = "AND m.utc_time >= (SELECT datetime(MAX(utc_time), '-7 days') FROM location_timestamps WHERE location_id = ?)";
        } else if (range === '1m') {
            timeFilter = "AND m.utc_time >= (SELECT datetime(MAX(utc_time), '-1 month') FROM location_timestamps WHERE location_id = ?)";
        }
        
        const pivotSelects = parameters.map(p => `AVG(CASE WHEN s.parameter = '${p}' THEN m.value END) as "${p}"`).join(', ');

        let dataQuery = `
            SELECT date(m.utc_time) as utc_time, ${pivotSelects}
            FROM measurements m
            JOIN sensors s ON m.sensor_id = s.id
            WHERE s.location_id = ?
        `;
        
        const queryParams = [id];
        
        if (range === '7d' || range === '1m') {
            dataQuery += ` ${timeFilter}`;
            queryParams.push(id);
        }
        
        dataQuery += `
            GROUP BY date(m.utc_time)
            ORDER BY date(m.utc_time) ASC
        `;
        
        const data = await queryAll(dataQuery, queryParams);
        
        return NextResponse.json(
            { data, parameters: sensors },
            {
                headers: {
                    'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, max-age=2592000',
                    'Vercel-CDN-Cache-Control': 'public, max-age=2592000',
                }
            }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
