import moment from 'moment'
import zlib from 'zlib'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const withDefaultTime = (value?: string): string | undefined => {
  if (value) {
    return moment(value).format('YYYY-MM-DDTHH:mm:ss')
  }
  return value
}

export const gzipBase64AndEncode = (input: string): string => {
  const buffer = Buffer.from(input, 'utf-8')
  const gzipped = zlib.gzipSync(buffer)
  const base64 = gzipped.toString('base64')
  return encodeURIComponent(base64)
}
