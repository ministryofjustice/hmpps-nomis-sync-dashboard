import type { StartCourtSentencingMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartCourtSentencingMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {},
  )
}
