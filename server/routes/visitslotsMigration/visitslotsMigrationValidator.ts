import { StartDateFilteredMigrationForm } from 'express-session'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartDateFilteredMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {},
  )
}
