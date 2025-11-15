/**
 * Type definitions for swagger-ui-react
 * This is a workaround until official types are available
 */

declare module 'swagger-ui-react' {
  import { Component } from 'react'

  export interface SwaggerUIProps {
    spec?: Record<string, unknown> | string
    url?: string
    deepLinking?: boolean
    displayOperationId?: boolean
    defaultModelsExpandDepth?: number
    defaultModelExpandDepth?: number
    [key: string]: unknown
  }

  export default class SwaggerUI extends Component<SwaggerUIProps> {}
}

