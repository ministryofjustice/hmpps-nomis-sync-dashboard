import { Request, Response } from 'express'
import { StartAdjudicationsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, AdjudicationsMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAdjudicationsMigrationValidator from './startAdjudicationsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'

interface Filter {
  prisonIds?: string[]
  fromDate?: string
  toDate?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class AdjudicationsMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getAdjudicationsMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getAdjudicationsMigrations(context(res))

    const decoratedMigrations = migrations.map(AdjudicationsMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: AdjudicationsMigrationController.applicationInsightsUrl(
        AdjudicationsMigrationController.alreadyMigratedApplicationInsightsQuery(
          history.whenStarted,
          history.whenEnded,
        ),
      ),
    }))
    res.render('pages/adjudications/adjudicationsMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewAdjudicationsMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startAdjudicationsMigrationForm
    await this.startAdjudicationsMigration(req, res)
  }

  async startAdjudicationsMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/adjudications/startAdjudicationsMigration', {
      form: req.session.startAdjudicationsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartAdjudicationsMigration(req: Request, res: Response): Promise<void> {
    req.session.startAdjudicationsMigrationForm = { ...trimForm(req.body) }

    const errors = startAdjudicationsMigrationValidator(req.session.startAdjudicationsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/adjudications-migration/amend')
    } else {
      const filter = AdjudicationsMigrationController.toFilter(req.session.startAdjudicationsMigrationForm)
      const count = await this.nomisPrisonerService.getAdjudicationsMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getAdjudicationsDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startAdjudicationsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startAdjudicationsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/adjudications-migration/start/preview')
    }
  }

  async startAdjudicationsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/adjudications/startAdjudicationsMigrationPreview', {
      form: req.session.startAdjudicationsMigrationForm,
    })
  }

  async postClearDLQAdjudicationsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteAdjudicationsFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAdjudicationsMigrationForm }
    await this.postStartAdjudicationsMigration(req, res)
  }

  async postStartAdjudicationsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AdjudicationsMigrationController.toFilter(req.session.startAdjudicationsMigrationForm)

    const result = await this.nomisMigrationService.startAdjudicationsMigration(filter, context(res))
    req.session.startAdjudicationsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startAdjudicationsMigrationForm.migrationId = result.migrationId
    res.redirect('/adjudications-migration/start/confirmation')
  }

  async startAdjudicationsMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/adjudications/startAdjudicationsMigrationConfirmation', {
      form: req.session.startAdjudicationsMigrationForm,
    })
  }

  async adjudicationsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getAdjudicationsMigration(migrationId, context(res))
    res.render('pages/adjudications/adjudicationsMigrationDetails', {
      migration: { ...migration, history: AdjudicationsMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getAdjudicationsFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: AdjudicationsMigrationController.applicationInsightsUrl(
          AdjudicationsMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/adjudications/adjudicationsMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelAdjudicationsMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getAdjudicationsMigration(migrationId, context(res))
    res.render('pages/adjudications/adjudicationsMigrationDetails', {
      migration: { ...migration, history: AdjudicationsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartAdjudicationsMigrationForm): AdjudicationsMigrationFilter {
    return {
      prisonIds: AdjudicationsMigrationController.asArray(form.prisonIds),
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }

  private static asArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim())
    }
    return value
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
    | where message contains 'Will not migrate the adjudication since it is migrated already,'
    | where timestamp between (datetime(${AdjudicationsMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${AdjudicationsMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonIds?: string
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonIds = filter.prisonIds?.join()
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterPrisonIds && { filterPrisonIds }),
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }
}
