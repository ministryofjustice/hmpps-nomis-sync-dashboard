import { Request, Response } from 'express'
import moment from 'moment'
import { PrisonerFilteredMigrationForm } from 'express-session'
import NomisMigrationService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisMigrationService'
import { Context } from '../../../services/nomisMigrationService'
import { MigrationHistory } from '../../../@types/migration'
import { buildUrl } from '../../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../../utils/trim'
import logger from '../../../../logger'
import NomisPrisonerService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisPrisonerService'

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
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrations(context(res))

    const decoratedMigrations = migrations
      .map(ContactPersonProfileDetailsMigrationController.withFilter)
      .map(history => ({
        ...history,
        applicationInsightsLink: ContactPersonProfileDetailsMigrationController.applicationInsightsUrl(
          ContactPersonProfileDetailsMigrationController.alreadyMigratedApplicationInsightsQuery(
            history.whenStarted,
            history.whenEnded,
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
    const dlqCountString = await this.nomisMigrationService.getDLQMessageCount(context(res))
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
    const result = await this.nomisMigrationService.deleteFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.prisonerFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = ContactPersonProfileDetailsMigrationController.toFilter(req.session.prisonerFilteredMigrationForm)

    const result = await this.nomisMigrationService.startMigration(filter, context(res))
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

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: ContactPersonProfileDetailsMigrationController.applicationInsightsUrl(
          ContactPersonProfileDetailsMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/contactperson/profiledetails/contactPersonProfileDetailsMigrationFailures', {
      failures: failuresDecorated,
    })
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
    | where timestamp between (datetime(${ContactPersonProfileDetailsMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${ContactPersonProfileDetailsMigrationController.toISODateTime(endedDate)}))
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
