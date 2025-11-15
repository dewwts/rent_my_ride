/**
 * Type definitions for swagger-jsdoc
 * This is a workaround until official types are available
 */

declare module 'swagger-jsdoc' {
  export interface Options {
    definition: {
      openapi?: string
      swagger?: string
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
      paths?: Record<string, unknown>
      components?: {
        securitySchemes?: Record<string, unknown>
        schemas?: Record<string, unknown>
      }
      [key: string]: unknown
    }
    apis: string[]
  }

  namespace swaggerJsdoc {
    interface Options {
      definition: {
        openapi?: string
        swagger?: string
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
        paths?: Record<string, unknown>
        components?: {
          securitySchemes?: Record<string, unknown>
          schemas?: Record<string, unknown>
        }
        [key: string]: unknown
      }
      apis: string[]
    }
  }

  function swaggerJsdoc(options: swaggerJsdoc.Options): Record<string, unknown>
  export default swaggerJsdoc
}

