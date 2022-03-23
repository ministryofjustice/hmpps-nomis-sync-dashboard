import type { StartVisitsMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartVisitsMigrationForm): Express.ValidationError[] {
  return validateForm(
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
}
