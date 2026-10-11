import { NextResponse } from 'next/server';
import { queryAll, queryGet } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    try {
        const baseQuery = `
            SELECT l.*, 
                (SELECT MIN(utc_time) FROM location_timestamps WHERE location_id = l.id) as min_date,
                (SELECT MAX(utc_time) FROM location_timestamps WHERE location_id = l.id) as max_date,
                (SELECT GROUP_CONCAT(DISTINCT parameter) FROM sensors WHERE location_id = l.id) as parameters,
                (SELECT COUNT(*) FROM location_timestamps WHERE location_id = l.id) as data_count,
                (SELECT COUNT(DISTINCT parameter) FROM sensors WHERE location_id = l.id) as param_count
            FROM locations l
        `;

        const ownerFilter = searchParams.get('owner') || '';
        
        let conditions = [];
        let params = [];
        
        if (ownerFilter) {
            if (ownerFilter.toLowerCase() === 'urban_unit' || ownerFilter.toLowerCase().includes('urban unit')) {
                conditions.push(`l.owner LIKE '%Urban Unit%'`);
            } else if (ownerFilter.toLowerCase() === 'reference' || ownerFilter.toLowerCase().includes('government')) {
                conditions.push(`(l.owner LIKE '%State%' OR l.owner LIKE '%Government%' OR l.instrument LIKE '%BAM%' OR l.sensor_type LIKE '%Reference%')`);
            } else if (ownerFilter.toLowerCase() === 'paqi') {
                conditions.push(`l.owner LIKE '%PAQI%'`);
            } else {
                conditions.push(`l.owner LIKE ?`);
                params.push(`%${ownerFilter}%`);
            }
        }
        
        if (search) {
            conditions.push(`(
                l.name LIKE ? OR 
                l.owner LIKE ? OR 
                l.provider LIKE ? OR 
                l.instrument LIKE ? OR 
                l.model LIKE ? OR 
                l.manufacturer LIKE ? OR 
                l.locality LIKE ?
            )`);
            params.push(
                `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, 
                `%${search}%`, `%${search}%`, `%${search}%`
            );
        }
        
        let query = baseQuery;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY data_count DESC, param_count DESC LIMIT 100`;

        const locations = await queryAll(query, params);
        
        // Count total for info
        const totalRow = await queryGet(`SELECT COUNT(*) as count FROM locations`);
        const total = totalRow ? totalRow.count : 0;
        
        return NextResponse.json(
            { locations, total },
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
