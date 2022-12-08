import { validate as validateForm } from '../../validation/validation'

export default function validate(prisonId: string): Express.ValidationError[] {
  return validateForm(
    { prisonId },
    { prisonId: 'required' },
    {
      'required.prisonId': 'Enter the 3 character prison code',
    },
  )
}
