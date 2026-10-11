import { NextResponse } from 'next/server';
import { queryAll, queryGet } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const page = parseInt(searchParams.get('page')) || 1;
        const offset = (page - 1) * limit;
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const sortDir = searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';
        
        // 1. Get all distinct parameters for this location, grouped to avoid duplicate parameter keys
        const sensors = await queryAll('SELECT parameter, MAX(units) as units FROM sensors WHERE location_id = ? GROUP BY parameter', [id]);
        if (sensors.length === 0) {
            return NextResponse.json({ data: [], parameters: [], total: 0, page: 1, limit, totalPages: 0 });
        }
        
        const parameters = sensors.map(s => s.parameter);
        
        // 2. Build the dynamic pivot SELECT
        const pivotSelects = parameters.map(p => `MAX(CASE WHEN s.parameter = '${p}' THEN m.value END) as "${p}"`).join(', ');
        
        // 3. Fast pagination using the optimized location_timestamps table
        let tsBase = `FROM location_timestamps WHERE location_id = ?`;
        const tsParams = [id];

        if (start) {
            tsBase += ` AND utc_time >= ?`;
            tsParams.push(start);
        }
        if (end) {
            tsBase += ` AND utc_time <= ?`;
            tsParams.push(end);
        }

        // Fast Count
        const countQuery = `SELECT COUNT(*) as total ` + tsBase;
        const totalResult = await queryGet(countQuery, tsParams);
        const totalCount = totalResult ? (totalResult.total || 0) : 0;

        // Fast Timestamps Fetch
        const tsQuery = `SELECT utc_time ${tsBase} ORDER BY utc_time ${sortDir} LIMIT ? OFFSET ?`;
        const tsRows = await queryAll(tsQuery, [...tsParams, limit, offset]);
        const times = tsRows.map(r => r.utc_time);

        let data = [];
        if (times.length > 0) {
            const placeholders = times.map(() => '?').join(',');
            const dataQuery = `
                SELECT m.utc_time, ${pivotSelects}
                FROM measurements m
                JOIN sensors s ON m.sensor_id = s.id
                WHERE s.location_id = ? AND m.utc_time IN (${placeholders})
                GROUP BY m.utc_time
                ORDER BY m.utc_time ${sortDir}
            `;
            data = await queryAll(dataQuery, [id, ...times]);
        }
        
        return NextResponse.json({
            data: data,
            parameters: sensors, // Send along the units too
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
