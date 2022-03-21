import { Request, Response } from 'express'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import trimForm from '../../utils/trim'
import startVisitsMigrationValidator from './startVisitsMigrationValidator'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class VisitMigrationController {
  constructor(private readonly visitMigrationService: NomisMigrationService) {}

  async getVisitMigrations(req: Request, res: Response): Promise<void> {
    const visitMigrations = await this.visitMigrationService.getVisitMigrations(context(res))

    res.render('pages/visits/visitsMigration', {
      visitMigrations,
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
