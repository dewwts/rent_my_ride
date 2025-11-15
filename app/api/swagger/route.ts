import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger.config'
import yaml from 'js-yaml'

export async function GET() {
  try {
    // Convert JSON to YAML
    const yamlString = yaml.dump(swaggerSpec, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      quotingType: '"',
    })

    return new NextResponse(yamlString, {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating Swagger spec:', error)
    return NextResponse.json(
      { error: 'Failed to generate Swagger documentation' },
      { status: 500 }
    )
  }
}

