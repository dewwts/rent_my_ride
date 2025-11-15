import swaggerJsdoc from 'swagger-jsdoc'
import type { Options } from 'swagger-jsdoc'

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Rent My Ride API',
      version: '1.0.0',
      description: `
        API documentation for Rent My Ride - A car rental platform.
        
        ## Authentication
        This API uses Supabase Authentication with server-side rendered (SSR) cookies.
        Most endpoints require authentication, and some require admin privileges.
        
        To authenticate:
        1. Use the Supabase client to sign in
        2. The session token will be stored in cookies automatically
        3. Include cookies in subsequent API requests
        
        ## Admin Endpoints
        Some endpoints require admin privileges. These are marked with \`x-admin-required: true\`.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
      {
        url: 'https://api.rentmyride.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Cars',
        description: 'Car management endpoints',
      },
      {
        name: 'Stripe',
        description: 'Stripe payment integration endpoints',
      },
      {
        name: 'Transactions',
        description: 'Transaction management endpoints',
      },
      {
        name: 'Webhooks',
        description: 'Webhook endpoints',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sb-access-token',
          description: `
            Supabase authentication token stored in cookies.
            The token is automatically set after successful login via Supabase Auth.
            Include cookies in requests to authenticated endpoints.
          `,
        },
      },
      schemas: {
        Car: {
          type: 'object',
          properties: {
            car_id: {
              type: 'string',
              example: 'car_123456',
            },
            car_brand: {
              type: 'string',
              example: 'Toyota',
            },
            model: {
              type: 'string',
              example: 'Camry',
            },
            mileage: {
              type: 'number',
              example: 50000,
            },
            year_created: {
              type: 'number',
              example: 2020,
            },
            number_of_seats: {
              type: 'number',
              example: 5,
            },
            gear_type: {
              type: 'string',
              example: 'ออโต้',
            },
            oil_type: {
              type: 'string',
              example: 'เบนซิน',
            },
            daily_rental_price: {
              type: 'number',
              example: 1500,
            },
            is_verified: {
              type: 'boolean',
              example: true,
            },
            status: {
              type: 'string',
              example: 'available',
            },
            location: {
              type: 'string',
              example: 'Bangkok',
            },
            car_conditionrating: {
              type: 'number',
              example: 4.5,
            },
            car_image: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/car-image.jpg',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            transaction_id: {
              type: 'string',
              example: 'trans_123456',
            },
            renting_id: {
              type: 'string',
              example: 'rent_123456',
            },
            lessee_id: {
              type: 'string',
              description: 'ID of the person renting the car',
              example: 'user_123',
            },
            lessor_id: {
              type: 'string',
              description: 'ID of the car owner',
              example: 'user_456',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in THB',
              example: 5000,
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Done', 'Failed'],
              example: 'Done',
            },
            transaction_date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            renting: {
              type: 'object',
              properties: {
                sdate: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date of rental',
                  example: '2024-01-20',
                },
                edate: {
                  type: 'string',
                  format: 'date',
                  description: 'End date of rental',
                  example: '2024-01-25',
                },
                status: {
                  type: 'string',
                  example: 'Confirmed',
                },
                car_information: {
                  type: 'object',
                  properties: {
                    car_brand: {
                      type: 'string',
                      example: 'Toyota',
                    },
                    model: {
                      type: 'string',
                      example: 'Camry',
                    },
                    year_created: {
                      type: 'number',
                      example: 2020,
                    },
                    car_image: {
                      type: 'string',
                      format: 'uri',
                      example: 'https://example.com/car-image.jpg',
                    },
                  },
                },
              },
            },
            lessee_info: {
              type: 'object',
              properties: {
                u_firstname: {
                  type: 'string',
                  example: 'John',
                },
                u_lastname: {
                  type: 'string',
                  example: 'Doe',
                },
              },
            },
            lessor_info: {
              type: 'object',
              properties: {
                u_firstname: {
                  type: 'string',
                  example: 'Jane',
                },
                u_lastname: {
                  type: 'string',
                  example: 'Smith',
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1,
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              example: 2,
            },
            prevPage: {
              type: 'integer',
              nullable: true,
              example: null,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            totalItems: {
              type: 'integer',
              example: 50,
            },
          },
        },
      },
    },
  },
  apis: [
    './app/api/**/*.ts', // Path to the API files with JSDoc comments
  ],
}

export const swaggerSpec = swaggerJsdoc(options)

