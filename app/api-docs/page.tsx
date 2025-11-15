'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
import type { OpenAPISpec } from '@/types/swagger'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the Swagger spec from our API (YAML format)
    fetch('/api/swagger')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch Swagger spec: ${res.statusText}`)
        }
        return res.text()
      })
      .then((yamlText) => {
        try {
          // Parse YAML to JSON for SwaggerUI
          // Using safeLoad to prevent code execution vulnerabilities
          // js-yaml v4: load() is safe by default, but we validate the result
          const parsedSpec = yaml.load(yamlText) as OpenAPISpec

          // Validate that parsed spec has required OpenAPI structure
          if (!parsedSpec || typeof parsedSpec !== 'object') {
            throw new Error('Invalid Swagger specification format')
          }

          if (!parsedSpec.openapi && !parsedSpec.swagger) {
            throw new Error('Invalid OpenAPI/Swagger specification')
          }

          setSpec(parsedSpec)
          setError(null)
        } catch (parseError) {
          console.error('Error parsing YAML:', parseError)
          setError('Failed to parse Swagger specification')
        }
      })
      .catch((fetchError) => {
        console.error('Error loading Swagger spec:', fetchError)
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load API documentation'
        )
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">
            Error Loading Documentation
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        spec={spec}
        deepLinking={true}
        displayOperationId={false}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
      />
    </div>
  )
}

