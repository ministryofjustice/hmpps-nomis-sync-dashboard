import zlib from 'zlib'
import { gzipBase64AndEncode, convertToTitleCase, initialiseName, withDefaultTime } from './utils'

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

const decodeBase64AndGunzip = (input: string): string => {
  const decoded = decodeURIComponent(input)
  const buffer = Buffer.from(decoded, 'base64')
  return zlib.gunzipSync(buffer).toString('utf-8')
}
export default decodeBase64AndGunzip

describe('gzipBase64AndEncode', () => {
  it('should return a base64 encoded gzipped string', () => {
    const input = 'Hello, world!'
    const result = gzipBase64AndEncode(input)
    expect(result.substring(0, 12)).toEqual('H4sIAAAAAAAA')
    expect(result.substring(13)).toEqual('%2FNIzcnJ11Eozy%2FKSVEEAObG5usNAAAA')
    expect(decodeBase64AndGunzip(result)).toEqual(input)
  })

  it('should return an empty string when input is empty', () => {
    const input = ''
    const result = gzipBase64AndEncode(input)
    expect(result.substring(0, 12)).toEqual('H4sIAAAAAAAA')
    expect(result.substring(13)).toEqual('wMAAAAAAAAAAAA%3D')
    expect(decodeBase64AndGunzip(result)).toEqual(input)
  })

  it('should handle special characters correctly', () => {
    const input = 'Special characters: !@#$%^&*()_+'
    const result = gzipBase64AndEncode(input)
    expect(result.substring(0, 12)).toEqual('H4sIAAAAAAAA')
    expect(result.substring(13)).toEqual('wsuSE3OTMxRSM5ILEpMLkktKrZSUHRQVlGNU9PS0IzXBgDrvQ7lIAAAAA%3D%3D')
    expect(decodeBase64AndGunzip(result)).toEqual(input)
  })

  it('should handle a proper log analytics message', () => {
    const input =
      'AppTraces\n' +
      "| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'\n" +
      "| where Message contains 'Will not migrate the nomis visit balance'\n" +
      '| where TimeGenerated between (datetime(2025-03-18T07:50:21.102Z) .. datetime(2025-03-18T07:50:41.730Z))\n' +
      '| summarize dcount(Message)'
    const result = gzipBase64AndEncode(input)
    expect(decodeBase64AndGunzip(result)).toEqual(input)
  })
})
