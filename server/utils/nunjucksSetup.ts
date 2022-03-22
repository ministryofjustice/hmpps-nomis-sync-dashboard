/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import { Error } from '../validation/validation'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'NOMIS Migration and Synchronisation Dashboard'

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter(
    'setChecked',
    (items, selectedList) =>
      items &&
      items.map((entry: { value: string }) => ({
        ...entry,
        checked: entry && selectedList && selectedList.includes(entry.value),
      }))
  )

  njkEnv.addFilter('findError', (array: Error[], formFieldId: string) => {
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })
}
