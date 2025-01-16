import { Request, Response } from 'express'
import moment from 'moment'
import { StartPrisonPersonMigrationForm } from 'express-session'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, PrisonPersonMigrationFilter } from '../../@types/migration'
import { buildUrl } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import getMigrationTypeDropdown from './migrationTypeDropdown'
import startPrisonPersonMigrationValidator from './startPrisonPersonMigrationValidator'

interface Filter {
  prisonerNumber?: string
  migrationType: PrisonPersonMigrationFilter['migrationType']
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class PrisonPersonMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

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

  async startNewPrisonPersonMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startPrisonPersonMigrationForm
    await this.startPrisonPersonMigration(req, res)
  }

  async startPrisonPersonMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonperson/startPrisonPersonMigration', {
      form: req.session.startPrisonPersonMigrationForm,
      migrationTypes: getMigrationTypeDropdown(req.session.startPrisonPersonMigrationForm?.migrationType),
      errors: req.flash('errors'),
    })
  }

  async postStartPrisonPersonMigration(req: Request, res: Response): Promise<void> {
    req.session.startPrisonPersonMigrationForm = { ...trimForm(req.body) }

    const errors = startPrisonPersonMigrationValidator(req.session.startPrisonPersonMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/prisonperson-migration/amend')
    } else {
      const count = await this.countPrisoners(res, req.body.prisonerNumber)
      const dlqCountString = await this.nomisMigrationService.getPrisonPersonDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startPrisonPersonMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startPrisonPersonMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/prisonperson-migration/start/preview')
    }
  }

  private async countPrisoners(res: Response, prisonerNumber?: string): Promise<number> {
    if (prisonerNumber != null && prisonerNumber.length > 0) {
      return 1
    }
    return this.nomisPrisonerService.getPrisonPersonMigrationEstimatedCount(context(res))
  }

  async startPrisonPersonMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonperson/startPrisonPersonMigrationPreview', {
      form: req.session.startPrisonPersonMigrationForm,
    })
  }

  async postClearDLQPrisonPersonMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deletePrisonPersonFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startPrisonPersonMigrationForm }
    await this.postStartPrisonPersonMigration(req, res)
  }

  async postStartPrisonPersonMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = PrisonPersonMigrationController.toFilter(req.session.startPrisonPersonMigrationForm)

    const result = await this.nomisMigrationService.startPrisonPersonMigration(filter, context(res))
    req.session.startPrisonPersonMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startPrisonPersonMigrationForm.migrationId = result.migrationId
    res.redirect('/prisonperson-migration/start/confirmation')
  }

  async startPrisonPersonMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonperson/startPrisonPersonMigrationConfirmation', {
      form: req.session.startPrisonPersonMigrationForm,
    })
  }

  async prisonPersonMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getPrisonPersonMigration(migrationId, context(res))
    res.render('pages/prisonperson/prisonPersonMigrationDetails', {
      migration: { ...migration, history: PrisonPersonMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getPrisonPersonFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: PrisonPersonMigrationController.applicationInsightsUrl(
          PrisonPersonMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/prisonperson/prisonPersonMigrationFailures', { failures: failuresDecorated })
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
    filterMigrationType: PrisonPersonMigrationFilter['migrationType']
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonerNumber = filter.prisonerNumber
    const filterMigrationType = filter.migrationType
    return {
      ...migration,
      ...(filterPrisonerNumber && { filterPrisonerNumber }),
      ...(filterMigrationType && { filterMigrationType }),
    }
  }

  private static toFilter(form: StartPrisonPersonMigrationForm): PrisonPersonMigrationFilter {
    return {
      prisonerNumber: form.prisonerNumber,
      migrationType: form.migrationType,
    }
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelPrisonPersonMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getPrisonPersonMigration(migrationId, context(res))
    res.render('pages/prisonperson/prisonPersonMigrationDetails', {
      migration: { ...migration, history: PrisonPersonMigrationController.withFilter(migration.history) },
    })
  }
}
