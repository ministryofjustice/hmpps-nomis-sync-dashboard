import type { VisitsMigrationViewFilter } from '../../@types/dashboard'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: VisitsMigrationViewFilter): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDateTime: 'datetime',
      toDateTime: 'datetime',
    },
    {
      'required.prisonIds': 'Enter one or more prison IDs',
      'required.visitTypes': 'Enter the type of visits to migrate',
    }
  )
}
