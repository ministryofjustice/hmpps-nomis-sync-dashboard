const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    nomisMigration: {
      url: get('NOMIS_MIGRATION_API_URL', 'http://localhost:8101', requiredInProduction) as string,
      timeout: {
        response: Number(get('NOMIS_MIGRATION_TIMEOUT_RESPONSE', 60000)),
        deadline: Number(get('NOMIS_MIGRATION_TIMEOUT_DEADLINE', 60000)),
      },
      agent: new AgentConfig(Number(get('NOMIS_MIGRATION_TIMEOUT_RESPONSE', 60000))),
    },
    nomisPrisoner: {
      url: get('NOMIS_PRISONER_API_URL', 'http://localhost:8102', requiredInProduction) as string,
      timeout: {
        response: Number(get('NOMIS_PRISONER_TIMEOUT_RESPONSE', 60000)),
        deadline: Number(get('NOMIS_PRISONER_TIMEOUT_DEADLINE', 60000)),
      },
      agent: new AgentConfig(Number(get('NOMIS_PRISONER_TIMEOUT_RESPONSE', 60000))),
    },
    activities: {
      url: get('ACTIVITIES_API_URL', 'http://localhost:8104', requiredInProduction) as string,
      timeout: {
        response: Number(get('ACTIVITIES_TIMEOUT_RESPONSE', 60000)),
        deadline: Number(get('ACTIVITIES_TIMEOUT_DEADLINE', 60000)),
      },
      agent: new AgentConfig(Number(get('ACTIVITIES_TIMEOUT_RESPONSE', 60000))),
    },
    mapping: {
      url: get('MAPPING_API_URL', 'http://localhost:8103', requiredInProduction) as string,
      timeout: {
        response: Number(get('MAPPING_TIMEOUT_RESPONSE', 60000)),
        deadline: Number(get('MAPPING_TIMEOUT_DEADLINE', 60000)),
      },
      agent: new AgentConfig(Number(get('MAPPING_TIMEOUT_RESPONSE', 60000))),
    },
    manageUsersApi: {
      url: get('MANAGE_USERS_API_URL', 'http://localhost:9091', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000))),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  applicationInsights: {
    url: get('APPLICATION_INSIGHTS_URL', 'http://localhost:8103/applicationinsights'),
    subscriptId: get('APPINSIGHTS_SUBSCRIPTION_ID', 'subscription', requiredInProduction),
    component: get('APPINSIGHTS_COMPONENT', 'component', requiredInProduction),
    resourceGroup: get('APPINSIGHTS_RESOURCE_GROUP', `${get('APPINSIGHTS_COMPONENT', 'component')}-rg`),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),
}
