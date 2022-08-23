import { Request, Response } from 'express'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory } from '../../@types/migration'
import { MigrationViewFilter } from '../../@types/dashboard'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import incentivesMigrationValidator from './incentivesMigrationValidator'

interface Filter {
  fromDate?: string
  toDate?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class IncentivesMigrationController {
  constructor(private readonly nomisMigrationService: NomisMigrationService) {}

  async getIncentiveMigrations(req: Request, res: Response): Promise<void> {
    const searchFilter = this.parseFilter(req)

    const errors = incentivesMigrationValidator(searchFilter)

    if (errors.length > 0) {
      res.render('pages/incentives/incentivesMigration', {
        errors,
        migrationViewFilter: searchFilter,
      })
    } else {
      const { migrations } = await this.nomisMigrationService.getIncentivesMigrations(context(res), {
        ...searchFilter,
      })

      const decoratedMigrations = migrations.map(IncentivesMigrationController.withFilter).map(history => ({
        ...history,
        applicationInsightsLink: IncentivesMigrationController.applicationInsightsUrl(
          IncentivesMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded)
        ),
      }))
      res.render('pages/incentives/incentivesMigration', {
        migrations: decoratedMigrations,
        migrationViewFilter: searchFilter,
        errors: [],
      })
    }
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getIncentivesFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: IncentivesMigrationController.applicationInsightsUrl(
          IncentivesMigrationController.messageApplicationInsightsQuery(message)
        ),
      })),
    }
    res.render('pages/incentives/incentivesMigrationFailures', { failures: failuresDecorated })
  }

  parseFilter(req: Request): MigrationViewFilter {
    return {
      toDateTime: req.query.toDateTime as string | undefined,
      fromDateTime: req.query.fromDateTime as string | undefined,
      includeOnlyFailures: (req.query.includeOnlyFailures as string) === 'true',
    }
  }

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where message contains 'Will not migrate visit since it is migrated already,'
    | where timestamp between (datetime(${IncentivesMigrationController.toISODateTime(
      startedDate
    )}) .. datetime(${IncentivesMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }
}
