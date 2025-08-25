import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check if DATABASE_URL is configured
    const isDatabaseConfigured = !!process.env.DATABASE_URL
    
    let databaseStatus = 'disconnected'
    let databaseError = null
    
    if (isDatabaseConfigured) {
      try {
        // Execute a simple query to test connection
        await prisma.$queryRaw`SELECT 1`
        
        databaseStatus = 'connected'
      } catch (error) {
        databaseStatus = 'error'
        databaseError = error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ok: databaseStatus === 'connected',
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: databaseStatus,
        configured: isDatabaseConfigured,
        error: databaseError
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.floor(process.uptime())
      }
    }, {
      status: databaseStatus === 'connected' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  }
}