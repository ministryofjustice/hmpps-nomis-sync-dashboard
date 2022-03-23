import { Request, Response } from 'express'
import { StartVisitsMigrationForm } from 'express-session'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import trimForm from '../../utils/trim'
import startVisitsMigrationValidator from './startVisitsMigrationValidator'
import type { GetVisitsByFilter } from '../../@types/nomisPrisoner'

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

export default class VisitMigrationController {
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

  private toFilter(form: StartVisitsMigrationForm): GetVisitsByFilter {
    return {
      prisonIds: this.asArray(form.prisonIds),
      visitTypes: this.asArray(form.visitTypes),
      fromDateTime: form.fromDateTime,
      toDateTime: form.toDateTime,
    }
  }

  private asArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim())
    }
    return value
  }
}
