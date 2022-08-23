import convertToTitleCase, { withDefaultTime } from './utils'

describe('utils', () => {
  describe('Convert to title case', () => {
    it('null string', () => {
      expect(convertToTitleCase(null)).toEqual('')
    })
    it('empty string', () => {
      expect(convertToTitleCase('')).toEqual('')
    })
    it('Lower Case', () => {
      expect(convertToTitleCase('robert')).toEqual('Robert')
    })
    it('Upper Case', () => {
      expect(convertToTitleCase('ROBERT')).toEqual('Robert')
    })
    it('Mixed Case', () => {
      expect(convertToTitleCase('RoBErT')).toEqual('Robert')
    })
    it('Multiple words', () => {
      expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
    })
    it('Leading spaces', () => {
      expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
    })
    it('Trailing spaces', () => {
      expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
    })
    it('Hyphenated', () => {
      expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
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
})
