import { Request } from 'express'
import type { StartVisitsMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartVisitsMigrationForm, req: Request): string {
  const errors = validateForm(
    form,
    {
      prisonIds: 'required',
      visitTypes: 'required',
      fromDateTime: 'datetime',
      toDateTime: 'datetime',
    },
    {
      'required.prisonIds': 'Enter one or more prison IDs',
      'required.visitTypes': 'Enter the type of visits to migrate',
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/visits-migration/start'
  }
  return form.action === 'startMigration' ? '/visits-migration/start/confirmation' : '/visits-migration/start'
}
