import moment from 'moment'
import { MoveActivityStartDateForm } from 'express-session'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: MoveActivityStartDateForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      activityStartDate: [`after:${moment().format('YYYY-MM-DD')}`],
      newActivityStartDate: ['required', 'date', `after:${form.activityStartDate}`],
    },
    {
      'after.activityStartDate': 'You cannot move the date for an activity that has already started.',
      'required.newActivityStartDate': 'Enter a date.',
      'date.newActivityStartDate': 'Enter a valid date.',
      'after.newActivityStartDate': 'The new activity start date must be after the existing start date.',
    },
  )
}
