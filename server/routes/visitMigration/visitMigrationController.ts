import { Request, Response } from 'express'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import trimForm from '../../utils/trim'
import startVisitsMigrationValidator from './startVisitsMigrationValidator'

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
  constructor(private readonly visitMigrationService: NomisMigrationService) {}

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

    res.redirect(startVisitsMigrationValidator(req.session.startVisitsMigrationForm, req))
  }

  async startVisitMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigrationConfirmation')
  }
}
