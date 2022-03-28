import type { MigrationViewFilter } from '../../@types/dashboard'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: MigrationViewFilter): Express.ValidationError[] {
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
