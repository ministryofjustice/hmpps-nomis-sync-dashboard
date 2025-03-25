import { Request, Response } from 'express'
import moment from 'moment'
import { PrisonerFilteredMigrationForm } from 'express-session'
import NomisMigrationService, { Context } from '../../../services/nomisMigrationService'
import { MigrationHistory } from '../../../@types/migration'
import { buildUrlNoTimespan } from '../../../utils/logAnalyticsUrlBuilder'
import trimForm from '../../../utils/trim'
import logger from '../../../../logger'
import NomisPrisonerService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisPrisonerService'
import ContactPersonProfileDetailsNomisMigrationService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisMigrationService'

interface Filter {
  prisonerNumber?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class ContactPersonProfileDetailsMigrationController {
  constructor(
    private readonly contactPersonProfileDetailsNomisMigrationService: ContactPersonProfileDetailsNomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'PERSONALRELATIONSHIPS_PROFILEDETAIL'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations
      .map(ContactPersonProfileDetailsMigrationController.withFilter)
      .map(history => ({
        ...history,
        applicationInsightsAllLink: ContactPersonProfileDetailsMigrationController.applicationInsightsUrl(
          ContactPersonProfileDetailsMigrationController.migrationsApplicationInsightsQuery(
            history.migrationId,
            history.whenStarted,
            history.whenEnded,
            false,
          ),
        ),
        applicationInsightsFailuresLink: ContactPersonProfileDetailsMigrationController.applicationInsightsUrl(
          ContactPersonProfileDetailsMigrationController.migrationsApplicationInsightsQuery(
            history.migrationId,
            history.whenStarted,
            history.whenEnded,
            true,
          ),
        ),
      }))
    res.render('pages/contactperson/profiledetails/contactPersonProfileDetailsMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.prisonerFilteredMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/profiledetails/startContactPersonProfileDetailsMigration', {
      form: req.session.prisonerFilteredMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.prisonerFilteredMigrationForm = { ...trimForm(req.body) }

    const count = await this.countPrisoners(res, req.body.prisonerNumber)
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.prisonerFilteredMigrationForm.estimatedCount = count.toLocaleString()
    req.session.prisonerFilteredMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/contactperson-profiledetails-migration/start/preview')
  }

  private async countPrisoners(res: Response, prisonerNumber?: string): Promise<number> {
    if (prisonerNumber != null && prisonerNumber.length > 0) {
      return 1
    }
    return this.nomisPrisonerService.getMigrationEstimatedCount(context(res))
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/profiledetails/startContactPersonProfileDetailsMigrationPreview', {
      form: req.session.prisonerFilteredMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.prisonerFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = ContactPersonProfileDetailsMigrationController.toFilter(req.session.prisonerFilteredMigrationForm)

    const result = await this.contactPersonProfileDetailsNomisMigrationService.startMigration(filter, context(res))
    req.session.prisonerFilteredMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.prisonerFilteredMigrationForm.migrationId = result.migrationId
    res.redirect('/contactperson-profiledetails-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/profiledetails/startContactPersonProfileDetailsMigrationConfirmation', {
      form: req.session.prisonerFilteredMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/contactperson/profiledetails/contactPersonProfileDetailsMigrationDetails', {
      migration: {
        ...migration,
        history: ContactPersonProfileDetailsMigrationController.withFilter(migration.history),
      },
    })
  }

  private static migrationsApplicationInsightsQuery(
    migrationId: string,
    startedDate: string,
    endedDate?: string,
    failed: boolean = false,
  ): string {
    const startDateQuery = `datetime(${this.toISODateTime(startedDate)})`
    const endDateQuery = endedDate ? `datetime(${this.toISODateTime(endedDate)})` : `now()`
    const failedQuery = failed ? '| where (Name endswith "failed" or Name endswith "error")' : ''
    return `AppEvents
      | where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
      | where TimeGenerated between (${startDateQuery} .. ${endDateQuery})
      | where Properties.migrationId startswith '${migrationId}'
      | where Name startswith 'contactperson-profiledetails-migration'
      ${failedQuery}
    `
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrlNoTimespan(query)
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

  private static toFilter(form: PrisonerFilteredMigrationForm): PrisonerFilteredMigrationForm {
    return {
      prisonerNumber: form.prisonerNumber,
    }
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/contactperson/profiledetails/contactPersonProfileDetailsMigrationDetails', {
      migration: {
        ...migration,
        history: ContactPersonProfileDetailsMigrationController.withFilter(migration.history),
      },
    })
  }
}
