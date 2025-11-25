import { DateRangeAndPrisonFilterMigrationForm } from 'express-session'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: DateRangeAndPrisonFilterMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {},
  )
}
