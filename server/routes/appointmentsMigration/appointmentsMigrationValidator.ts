import type { AppointmentsMigrationViewFilter } from '../../@types/dashboard'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: AppointmentsMigrationViewFilter): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonIds: 'required',
      fromDateTime: 'datetime',
      toDateTime: 'datetime',
    },
    {
      'required.prisonIds': 'Enter one or more prison IDs',
    },
  )
}
