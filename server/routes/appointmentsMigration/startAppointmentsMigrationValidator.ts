import type { StartAppointmentsMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartAppointmentsMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonIds: 'required',
      fromDate: 'date',
      toDate: 'date',
    },
    {
      'required.prisonIds': 'Enter one or more prison IDs',
    },
  )
}
