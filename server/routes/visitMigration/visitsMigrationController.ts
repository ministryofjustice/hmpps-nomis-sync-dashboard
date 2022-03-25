import { Request, Response } from 'express'
import { StartVisitsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import trimForm from '../../utils/trim'
import startVisitsMigrationValidator from './startVisitsMigrationValidator'
import { VisitsMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'

interface Filter {
  prisonIds?: string[]
  visitTypes?: string[]
  fromDateTime?: string
  toDateTime?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class VisitsMigrationController {
  constructor(
    private readonly visitMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService
  ) {}

  async getVisitMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.visitMigrationService.getVisitMigrations(context(res))
    const decoratedMigrations = migrations.map(migration => {
      const filter: Filter = JSON.parse(migration.filter)
      const filterPrisonIds = filter.prisonIds?.join()
      const filterVisitTypes = filter.visitTypes?.join()
      const filterToDate = filter.toDateTime
      const filterFromDate = filter.fromDateTime
      return {
        ...migration,
        ...(filterPrisonIds && { filterPrisonIds }),
        ...(filterVisitTypes && { filterVisitTypes }),
        ...(filterToDate && { filterToDate }),
        ...(filterFromDate && { filterFromDate }),
      }
    })
    res.render('pages/visits/visitsMigration', {
      migrations: decoratedMigrations,
    })
  }

  async startVisitMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigration', {
      form: req.session.startVisitsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartVisitMigration(req: Request, res: Response): Promise<void> {
    req.session.startVisitsMigrationForm = { ...trimForm(req.body) }

    const errors = startVisitsMigrationValidator(req.session.startVisitsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/visits-migration/start')
    } else {
      const filter = this.toFilter(req.session.startVisitsMigrationForm)

      if (req.session.startVisitsMigrationForm.action === 'startMigration') {
        const result = await this.visitMigrationService.startVisitsMigration(filter, context(res))
        req.session.startVisitsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
        req.session.startVisitsMigrationForm.migrationId = result.migrationId
        res.redirect('/visits-migration/start/confirmation')
      } else {
        const count = await this.nomisPrisonerService.getVisitMigrationEstimatedCount(filter, context(res))
        req.session.startVisitsMigrationForm.estimatedCount = count.toLocaleString()
        res.redirect('/visits-migration/start')
      }
    }
  }

  async startVisitMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigrationConfirmation', { form: req.session.startVisitsMigrationForm })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.visitMigrationService.getFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: this.applicationInsightsUrl(this.applicationInsightsQuery(message)),
      })),
    }
    res.render('pages/visits/visitsMigrationFailures', { failures: failuresDecorated })
  }

  private toFilter(form: StartVisitsMigrationForm): VisitsMigrationFilter {
    return {
      prisonIds: this.asArray(form.prisonIds),
      visitTypes: this.asArray(form.visitTypes),
      fromDateTime: this.withDefaultTime(form.fromDateTime),
      toDateTime: this.withDefaultTime(form.toDateTime),
      ignoreMissingRoom: false,
    }
  }

  private asArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim())
    }
    return value
  }

  private withDefaultTime(value?: string): string | undefined {
    if (value) {
      return moment(value).format('YYYY-MM-DDTHH:mm:ss')
    }
    return value
  }

  private applicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }
}
