import { Request, Response } from 'express'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'

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
    res.render('pages/visits/startVisitsMigration')
  }
}
