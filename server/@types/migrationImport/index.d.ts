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
  '/migrate/visits': {
    /** Starts an asynchronous migration process. This operation will return immediately and the migration will be performed asynchronously. Requires role <b>MIGRATE_VISITS</b> */
    post: operations['migrateVisits']
  }
  '/queue-admin/get-dlq-messages/{dlqName}': {
    get: operations['getDlqMessages']
  }
  '/migrate/visits/rooms/usage': {
    /** Retrieves a list of rooms with usage count and vsip mapping for the (filtered) visits */
    get: operations['getVisitRoomUsageDetailsByFilter']
  }
  '/migrate/visits/history': {
    /** The records are un-paged and requires role <b>MIGRATE_VISITS</b> */
    get: operations['getAll']
  }
  '/migrate/visits/history/{migrationId}': {
    /** Requires role <b>MIGRATE_VISITS</b> */
    get: operations['get']
  }
  '/history': {
    /** The records are un-paged and requires role <b>MIGRATION_ADMIN</b> */
    get: operations['getAll_1']
    /** This is only required for test environments and requires role <b>MIGRATION_ADMIN</b> */
    delete: operations['deleteAll']
  }
}

export interface components {
  schemas: {
    Message: {
      messageId?: string
      receiptHandle?: string
      body?: string
      attributes?: { [key: string]: string }
      messageAttributes?: {
        [key: string]: components['schemas']['MessageAttributeValue']
      }
      md5OfBody?: string
      md5OfMessageAttributes?: string
    }
    MessageAttributeValue: {
      stringValue?: string
      binaryValue?: {
        /** Format: int32 */
        short?: number
        char?: string
        /** Format: int32 */
        int?: number
        /** Format: int64 */
        long?: number
        /** Format: float */
        float?: number
        /** Format: double */
        double?: number
        direct?: boolean
        readOnly?: boolean
      }
      stringListValues?: string[]
      binaryListValues?: {
        /** Format: int32 */
        short?: number
        char?: string
        /** Format: int32 */
        int?: number
        /** Format: int64 */
        long?: number
        /** Format: float */
        float?: number
        /** Format: double */
        double?: number
        direct?: boolean
        readOnly?: boolean
      }[]
      dataType?: string
    }
    RetryDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      messages: components['schemas']['Message'][]
    }
    PurgeQueueResult: {
      /** Format: int32 */
      messagesFoundCount: number
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
       * @default SCON
       * @example SCON,OFFI
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
      /** @description When true exclude visits without an associated room (visits created during the VSIP synchronisation process), defaults to false. Only required during testing when mapping records are manually deleted */
      ignoreMissingRoom: boolean
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
    MigrationContextVisitsMigrationFilter: {
      migrationId: string
      /** Format: int64 */
      estimatedCount: number
      body: components['schemas']['VisitsMigrationFilter']
    }
    DlqMessage: {
      body: { [key: string]: { [key: string]: unknown } }
      messageId: string
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
      migrationType: 'VISITS'
      /** @enum {string} */
      status: 'STARTED' | 'COMPLETED'
      id: string
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
  /** Requires role <b>MIGRATE_VISITS</b> */
  get: {
    parameters: {
      path: {
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
  /** The records are un-paged and requires role <b>MIGRATION_ADMIN</b> */
  getAll_1: {
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
