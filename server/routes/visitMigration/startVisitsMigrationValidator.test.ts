import { Request } from 'express'
import type { StartVisitsMigrationForm } from 'forms'
import validate from './startVisitsMigrationValidator'

describe('startVisitsMigrationValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect to success page when everthing is valid and selected migration', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form, req)).toEqual('/visits-migration/start/confirmation')
  })

  it('should redirect to back to start page when everthing is valid and selected view estimated count', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      action: 'viewEstimatedCount',
    }
    expect(validate(form, req)).toEqual('/visits-migration/start')
  })

  it('should reject empty prisonIds', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      prisonIds: '',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start')
    expect(req.flash).toBeCalledWith('errors', [{ href: '#prisonIds', text: 'Enter one or more prison IDs' }])
  })

  it('should reject empty visit types', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      visitTypes: '',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start')
    expect(req.flash).toBeCalledWith('errors', [{ href: '#visitTypes', text: 'Enter the type of visits to migrate' }])
  })

  it('should reject invalid fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: 'invalid',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start')
    expect(req.flash).toBeCalledWith('errors', [
      { href: '#fromDateTime', text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23' },
    ])
  })

  it('should reject invalid toDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      toDateTime: 'invalid',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start')
    expect(req.flash).toBeCalledWith('errors', [
      { href: '#toDateTime', text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23' },
    ])
  })

  it('should allow short time format in to/fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: '2020-03-23T12',
      toDateTime: '2020-03-23T12',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start/confirmation')
  })

  it('should allow just date in to/fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: '2020-03-23',
      toDateTime: '2020-03-23',
    }

    expect(validate(form, req)).toEqual('/visits-migration/start/confirmation')
  })
})

const validForm: StartVisitsMigrationForm = {
  prisonIds: 'HEI',
  visitTypes: ['SCON'],
  fromDateTime: '2020-03-23T12:00:00',
  toDateTime: '2020-03-24T12:00:00',
  action: 'startMigration',
}
