// eslint-disable-next-line import/no-named-as-default
import Validator, { ErrorMessages, Rules } from 'validatorjs'
import isISO8601 from 'validator/lib/isISO8601'
import moment from 'moment'

export interface Error {
  href: string
  text: string
}

Validator.register(
  'datetime',
  value => {
    if (typeof value === 'string') {
      return isISO8601(value, { strict: true })
    }
    return false
  },
  'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
)

Validator.register(
  'date',
  value => {
    if (typeof value === 'string') {
      return isISO8601(value, { strict: true })
    }
    return false
  },
  'Enter a real date, like 2020-03-23',
)

Validator.register(
  'after',
  (date: string, params: string): boolean => {
    const val1 = date
    const val2 = params.split(',')[0]

    if (!isISO8601(val1, { strict: true }) || !isISO8601(val2, { strict: true })) return false

    const inputDate = moment(val1, 'YYYY-MM-DD')
    const afterDate = moment(val2, 'YYYY-MM-DD')

    return inputDate.isAfter(afterDate)
  },
  'The :attribute must be after :after.',
)

export function validate<T>(form: T, rules: Rules, customMessages: ErrorMessages) {
  const validation = new Validator(form, rules, customMessages)

  return checkErrors(validation)
}
const checkErrors = <T>(validation: Validator.Validator<T>) => {
  validation.check()
  return asErrors(validation.errors)
}

const asErrors = (errors: Validator.Errors): Error[] =>
  Object.keys(errors.all()).map(key => {
    const message = errors.first(key) as string
    return { text: message, href: `#${key}` }
  })
