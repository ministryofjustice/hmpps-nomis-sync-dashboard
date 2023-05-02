/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/queue-admin/retry-dlq/{dlqName}': {
    put: operations['retryDlq']
  }
  '/queue-admin/retry-all-dlqs': {
    put: operations['retryAllDlqs']
  }
  '/queue-admin/purge-queue/{queueName}': {
    put: operations['purgeQueue']
  }
  '/migrate/visits/{migrationId}/cancel': {
    /** Requires role <b>MIGRATE_VISITS</b> */
    post: operations['cancel']
  }
  '/migrate/visits': {
    /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_VISITS</b> */
    post: operations['migrateVisits']
  }
  '/migrate/sentencing/{migrationId}/cancel': {
    /** Requires role <b>MIGRATE_SENTENCING</b> */
    post: operations['cancel_1']
  }
  '/migrate/sentencing': {
    /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_SENTENCING</b> */
    post: operations['migrateSentencing']
  }
  '/migrate/appointments/{migrationId}/cancel': {
    /** Requires role <b>MIGRATE_APPOINTMENTS</b> */
    post: operations['cancel_2']
  }
  '/migrate/appointments': {
    /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_APPOINTMENTS</b> */
    post: operations['migrateAppointments']
  }
  '/queue-admin/get-dlq-messages/{dlqName}': {
    get: operations['getDlqMessages']
  }
  '/migrate/visits/rooms/usage': {
    /** Retrieves a list of rooms with usage count and vsip mapping for the (filtered) visits */
    get: operations['getVisitRoomUsageDetailsByFilter']
  }
  '/migrate/visits/history/{migrationId}': {
    /** Requires role <b>MIGRATE_VISITS</b> */
    get: operations['get']
  }
  '/migrate/visits/history': {
    /** The records are un-paged and requires role <b>MIGRATE_VISITS</b> */
    get: operations['getAll']
  }
  '/migrate/sentencing/history/{migrationId}': {
    /** Requires role <b>MIGRATE_SENTENCING</b> */
    get: operations['get_1']
  }
  '/migrate/sentencing/history': {
    /** The records are un-paged and requires role <b>MIGRATE_SENTENCING</b> */
    get: operations['getAll_1']
  }
  '/migrate/appointments/history/{migrationId}': {
    /** Requires role <b>MIGRATE_APPOINTMENTS</b> */
    get: operations['get_2']
  }
  '/migrate/appointments/history': {
    /** The records are un-paged and requires role <b>MIGRATE_APPOINTMENTS</b> */
    get: operations['getAll_2']
  }
  '/history': {
    /** The records are un-paged and requires role <b>MIGRATION_ADMIN</b> */
    get: operations['getAll_3']
    /** This is only required for test environments and requires role <b>MIGRATION_ADMIN</b> */
    delete: operations['deleteAll']
  }
}

export interface components {
  schemas: {
    DlqMessage: {
      body: { [key: string]: { [key: string]: unknown } }
      messageId: string
    }
    RetryDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      messages: components['schemas']['DlqMessage'][]
    }
    PurgeQueueResult: {
      /** Format: int32 */
      messagesFoundCount: number
    }
    ErrorResponse: {
      /** Format: int32 */
      status: number
      /** Format: int32 */
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** @description Filter specifying what should be migrated from NOMIS to Visits service */
    VisitsMigrationFilter: {
      /**
       * @description List of prison Ids (AKA Agency Ids) to migrate visits from
       * @example MDI
       */
      prisonIds: string[]
      /**
       * @description List of visit types to migrate
       * @default [
       *   "SCON"
       * ]
       * @example [
       *   "SCON",
       *   "OFFI"
       * ]
       */
      visitTypes: string[]
      /**
       * @description Only include visits created after this date. NB this is creation date not the actual visit date
       * @example 2021-07-05T10:35:17
       */
      fromDateTime?: string
      /**
       * @description Only include visits created before this date. NB this is creation date not the actual visit date
       * @example 2021-07-05T10:35:17
       */
      toDateTime?: string
      /**
       * @description When true exclude visits without an associated room (visits created during the VSIP synchronisation process), defaults to false. Only required during testing when mapping records are manually deleted
       * @default false
       * @example false
       */
      ignoreMissingRoom: boolean
    }
    MigrationContextVisitsMigrationFilter: {
      /** @enum {string} */
      type: 'VISITS' | 'SENTENCING_ADJUSTMENTS' | 'APPOINTMENTS'
      migrationId: string
      /** Format: int64 */
      estimatedCount: number
      body: components['schemas']['VisitsMigrationFilter']
    }
    /** @description Filter specifying what should be migrated from NOMIS to Sentencing service */
    SentencingMigrationFilter: {
      /**
       * Format: date
       * @description Only include Sentencing entity issued on or after this date
       * @example 2020-03-23
       */
      fromDate?: string
      /**
       * Format: date
       * @description Only include Sentencing entity issued before or on this date
       * @example 2020-03-24
       */
      toDate?: string
    }
    MigrationContextSentencingMigrationFilter: {
      /** @enum {string} */
      type: 'VISITS' | 'SENTENCING_ADJUSTMENTS' | 'APPOINTMENTS'
      migrationId: string
      /** Format: int64 */
      estimatedCount: number
      body: components['schemas']['SentencingMigrationFilter']
    }
    /** @description Filter specifying what should be migrated from NOMIS to Appointments service */
    AppointmentsMigrationFilter: {
      /**
       * Format: date
       * @description Only include appointments on or after this date
       * @example 2020-03-23
       */
      fromDate?: string
      /**
       * Format: date
       * @description Only include appointments before or on this date
       * @example 2020-03-24
       */
      toDate?: string
      /**
       * @description Only include appointments for these prison ids
       * @example ['MDI','LEI']
       */
      prisonIds: string[]
    }
    MigrationContextAppointmentsMigrationFilter: {
      /** @enum {string} */
      type: 'VISITS' | 'SENTENCING_ADJUSTMENTS' | 'APPOINTMENTS'
      migrationId: string
      /** Format: int64 */
      estimatedCount: number
      body: components['schemas']['AppointmentsMigrationFilter']
    }
    GetDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      /** Format: int32 */
      messagesReturnedCount: number
      messages: components['schemas']['DlqMessage'][]
    }
    /** @description Visit room usage and vsip mapping */
    VisitRoomUsageResponse: {
      /** @description The nomis internal location description */
      agencyInternalLocationDescription: string
      /**
       * Format: int64
       * @description room usage count
       */
      count: number
      /** @description VSIP room mapping */
      vsipRoom?: string
      /** @description The nomis prison id */
      prisonId: string
    }
    MigrationHistory: {
      migrationId: string
      /** @example 2021-07-05T10:35:17 */
      whenStarted: string
      /** @example 2021-07-05T10:35:17 */
      whenEnded?: string
      /** Format: int64 */
      estimatedRecordCount: number
      filter?: string
      /** Format: int64 */
      recordsMigrated: number
      /** Format: int64 */
      recordsFailed: number
      /** @enum {string} */
      migrationType: 'VISITS' | 'SENTENCING_ADJUSTMENTS' | 'APPOINTMENTS'
      /** @enum {string} */
      status: 'STARTED' | 'COMPLETED' | 'CANCELLED_REQUESTED' | 'CANCELLED'
      id: string
      isNew: boolean
    }
  }
}

export interface operations {
  retryDlq: {
    parameters: {
      path: {
        dlqName: string
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult']
        }
      }
    }
  }
  retryAllDlqs: {
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult'][]
        }
      }
    }
  }
  purgeQueue: {
    parameters: {
      path: {
        queueName: string
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['PurgeQueueResult']
        }
      }
    }
  }
  /** Requires role <b>MIGRATE_VISITS</b> */
  cancel: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** Cancellation request accepted */
      202: unknown
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** No running migration found with migration id */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_VISITS</b> */
  migrateVisits: {
    responses: {
      /** Migration process started */
      202: {
        content: {
          'application/json': components['schemas']['MigrationContextVisitsMigrationFilter']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to start migration */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['VisitsMigrationFilter']
      }
    }
  }
  /** Requires role <b>MIGRATE_SENTENCING</b> */
  cancel_1: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** Cancellation request accepted */
      202: unknown
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** No running migration found with migration id */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_SENTENCING</b> */
  migrateSentencing: {
    responses: {
      /** Migration process started */
      202: {
        content: {
          'application/json': components['schemas']['MigrationContextSentencingMigrationFilter']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to start migration */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['SentencingMigrationFilter']
      }
    }
  }
  /** Requires role <b>MIGRATE_APPOINTMENTS</b> */
  cancel_2: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** Cancellation request accepted */
      202: unknown
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** No running migration found with migration id */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_APPOINTMENTS</b> */
  migrateAppointments: {
    responses: {
      /** Migration process started */
      202: {
        content: {
          'application/json': components['schemas']['MigrationContextAppointmentsMigrationFilter']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to start migration */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AppointmentsMigrationFilter']
      }
    }
  }
  getDlqMessages: {
    parameters: {
      path: {
        dlqName: string
      }
      query: {
        maxMessages?: number
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['GetDlqResult']
        }
      }
    }
  }
  /** Retrieves a list of rooms with usage count and vsip mapping for the (filtered) visits */
  getVisitRoomUsageDetailsByFilter: {
    parameters: {
      query: {
        /** Filter results by prison ids (returns all prisons if not specified) */
        prisonIds?: string[]
        /** Filter results by visitType (returns all types if not specified) */
        visitTypes?: string[]
        /** Filter results by visits that start on or after the given timestamp */
        fromDateTime?: string
        /** Filter results by visits that start on or before the given timestamp */
        toDateTime?: string
      }
    }
    responses: {
      /** list of visit room and count is returned */
      200: {
        content: {
          'application/json': components['schemas']['VisitRoomUsageResponse'][]
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to start migration */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Requires role <b>MIGRATE_VISITS</b> */
  get: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** The visit migration history record */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Migration not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** The records are un-paged and requires role <b>MIGRATE_VISITS</b> */
  getAll: {
    parameters: {
      query: {
        /** Only include migrations started after this date time */
        fromDateTime?: string
        /** Only include migrations started before this date time */
        toDateTime?: string
        /** When true only include migrations that had at least one failure */
        includeOnlyFailures?: boolean
        /** Specify the prison associated with the migration */
        prisonId?: string
      }
    }
    responses: {
      /** All visit migration history records */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory'][]
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Requires role <b>MIGRATE_SENTENCING</b> */
  get_1: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** The sentencing migration history record */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Migration not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** The records are un-paged and requires role <b>MIGRATE_SENTENCING</b> */
  getAll_1: {
    parameters: {
      query: {
        /** Only include migrations started after this date time */
        fromDateTime?: string
        /** Only include migrations started before this date time */
        toDateTime?: string
        /** When true only include migrations that had at least one failure */
        includeOnlyFailures?: boolean
      }
    }
    responses: {
      /** All sentencing migration history records */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory'][]
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Requires role <b>MIGRATE_APPOINTMENTS</b> */
  get_2: {
    parameters: {
      path: {
        /** Migration Id */
        migrationId: string
      }
    }
    responses: {
      /** The migration history record */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Migration not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** The records are un-paged and requires role <b>MIGRATE_APPOINTMENTS</b> */
  getAll_2: {
    parameters: {
      query: {
        /** Only include migrations started after this date time */
        fromDateTime?: string
        /** Only include migrations started before this date time */
        toDateTime?: string
        /** When true only include migrations that had at least one failure */
        includeOnlyFailures?: boolean
      }
    }
    responses: {
      /** All migration history records */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory'][]
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** The records are un-paged and requires role <b>MIGRATION_ADMIN</b> */
  getAll_3: {
    parameters: {
      query: {
        /** List of migration types, when omitted all migration types will be returned */
        migrationTypes?: string[]
        /** Only include migrations started after this date time */
        fromDateTime?: string
        /** Only include migrations started before this date time */
        toDateTime?: string
        /** When true only include migrations that had at least one failure */
        includeOnlyFailures?: boolean
        /** Specify a word of phrase that will appear in the filter related to the migration */
        filterContains?: string
      }
    }
    responses: {
      /** All history records */
      200: {
        content: {
          'application/json': components['schemas']['MigrationHistory'][]
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** This is only required for test environments and requires role <b>MIGRATION_ADMIN</b> */
  deleteAll: {
    responses: {
      /** All history records deleted */
      204: never
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to access this endpoint */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
}
