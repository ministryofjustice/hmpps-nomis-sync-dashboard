import { Request, Response } from 'express'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'

interface Filter {
  prisonerNumber?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class PrisonPersonMigrationController {
  constructor(private readonly nomisMigrationService: NomisMigrationService) {}

  async getPrisonPersonMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getPrisonPersonMigrations(context(res))

    const decoratedMigrations = migrations.map(PrisonPersonMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: PrisonPersonMigrationController.applicationInsightsUrl(
        PrisonPersonMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/prisonperson/prisonPersonMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where message startswith 'Will not migrate the courseActivityId'
    | where timestamp between (datetime(${PrisonPersonMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${PrisonPersonMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonerNumber?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonerNumber = filter.prisonerNumber
    return {
      ...migration,
      ...(filterPrisonerNumber && { filterPrisonerNumber }),
    }
  }
}
