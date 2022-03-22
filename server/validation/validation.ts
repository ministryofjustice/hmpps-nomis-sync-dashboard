import Validator, { ErrorMessages, Rules } from 'validatorjs'
import isISO8601 from 'validator/lib/isISO8601'

export interface Error {
  href: string
  text: string
}

Validator.register(
  'datetime',
  value => {
    if (typeof value === 'string') {
      return isISO8601(value)
    }
    return false
  },
  'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23'
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
