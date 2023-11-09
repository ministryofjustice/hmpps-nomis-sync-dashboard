import { convertToTitleCase, initialiseName, withDefaultTime } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('withDefaultTime', () => {
  it('will add a midnight time if not present', () => {
    expect(withDefaultTime('2020-03-23')).toEqual('2020-03-23T00:00:00')
  })
  it('will leave time if present', () => {
    expect(withDefaultTime('2020-03-23T09:12:11')).toEqual('2020-03-23T09:12:11')
  })

  it('will normalise time if present', () => {
    expect(withDefaultTime('2020-03-23T09:12')).toEqual('2020-03-23T09:12:00')
  })

  it('will as undefined', () => {
    expect(withDefaultTime(undefined)).toEqual(undefined)
  })
})
