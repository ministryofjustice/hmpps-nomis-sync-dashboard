import express from 'express'
import path from 'path'
import nunjucksSetup from './nunjucksSetup'

describe('json', () => {
  const app = express()
  const njk = nunjucksSetup(app, path)
  it('converts null to null', () => {
    const result = njk.getFilter('json')(undefined)
    expect(result).toBe(null)
  })
  it('converts object in full', () => {
    const result = njk.getFilter('json')({ one: 'one', two: 'two', three: 'three' })
    expect(result).toEqual('{"one":"one","two":"two","three":"three"}')
  })
  it('can filter properties from output', () => {
    const result = njk.getFilter('json')({ one: 'one', two: 'two', three: 'three' }, ['two'])
    expect(result).toEqual('{"one":"one","three":"three"}')
  })
  it('can filter several properties from output', () => {
    const result = njk.getFilter('json')({ one: 'one', two: 'two', three: 'three' }, ['two', 'three'])
    expect(result).toEqual('{"one":"one"}')
  })
})
