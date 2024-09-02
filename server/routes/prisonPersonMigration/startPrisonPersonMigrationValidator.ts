import type { StartPrisonPersonMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartPrisonPersonMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      migrationType: ['required'],
    },
    {
      'required.migrationType': 'Select a migration type.',
    },
  )
}
