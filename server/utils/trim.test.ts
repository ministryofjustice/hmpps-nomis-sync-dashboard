import trimForm from './trim'

describe('trimForm', () => {
  it('empty object unchanged', () => {
    expect(trimForm({})).toEqual({})
  })
  it('will trim string properties', () => {
    expect(
      trimForm({
        firstName: 'Andy  ',
        surname: 'Marke  ',
        age: 21,
      })
    ).toEqual({ firstName: 'Andy', surname: 'Marke', age: 21 })
  })
  it('will trim string in arrays properties', () => {
    expect(
      trimForm({
        aliases: ['Andy  ', 'Marke  '],
        age: 21,
      })
    ).toEqual({ aliases: ['Andy', 'Marke'], age: 21 })
  })
  it('will trim strings in nested object properties', () => {
    expect(
      trimForm({
        customer: {
          firstName: 'Andy  ',
          surname: 'Marke  ',
        },
        age: 21,
      })
    ).toEqual({ customer: { firstName: 'Andy', surname: 'Marke' }, age: 21 })
  })
  it('will trim recursively', () => {
    expect(
      trimForm({
        customer: {
          firstName: 'Andy  ',
          surname: 'Marke  ',
          aliases: [
            {
              firstName: 'Andy  ',
              surname: 'Marke  ',
              others: ['Andy  ', '   Marke'],
            },
          ],
        },
        age: 21,
      })
    ).toEqual({
      customer: {
        aliases: [
          {
            firstName: 'Andy',
            surname: 'Marke',
            others: ['Andy', 'Marke'],
          },
        ],
        firstName: 'Andy',
        surname: 'Marke',
      },
      age: 21,
    })
  })
})
