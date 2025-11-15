/**
 * Type definitions for OpenAPI/Swagger specification
 */

// OpenAPI 3.0.3 Specification types
export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
    contact?: {
      name?: string
      email?: string
    }
    license?: {
      name: string
    }
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  tags?: Array<{
    name: string
    description?: string
  }>
  paths: Record<string, unknown>
  components?: {
    securitySchemes?: Record<string, unknown>
    schemas?: Record<string, unknown>
  }
  [key: string]: unknown
}

