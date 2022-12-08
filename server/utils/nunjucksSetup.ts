/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import moment from 'moment'
import querystring, { ParsedUrlQueryInput } from 'querystring'
import { Error } from '../validation/validation'
import { VisitsMigrationViewFilter, MigrationViewFilter } from '../@types/dashboard'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): nunjucks.Environment {
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
    },
  )

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('formatDate', (value, format) => (value ? moment(value).format(format) : null))
  njkEnv.addFilter('json', (value, excludeProperties: string[] = []) => {
    const propsToExclude = excludeProperties.reduce((acc, prop) => ({ ...acc, [prop]: undefined }), {})
    return value ? JSON.stringify({ ...value, ...propsToExclude }) : null
  })

  njkEnv.addFilter(
    'setChecked',
    (items, selectedList) =>
      items &&
      items.map((entry: { value: string }) => ({
        ...entry,
        checked: entry && selectedList && selectedList.includes(entry.value),
      })),
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

  njkEnv.addFilter('toPrisonListFilter', (filterOptionsHtml: string, migrationViewFilter: MigrationViewFilter) => {
    const hrefBase = '/visits-migration?'
    const prisonFilterTags = getPrisonFilterTags(migrationViewFilter, hrefBase)
    const toDateFilterTags = getToDateFilterTags(migrationViewFilter, hrefBase)
    const fromDateFilterTags = getFromDateFilterTags(migrationViewFilter, hrefBase)
    const failedFilterTags = getFailedFilterTags(migrationViewFilter, hrefBase)

    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/visits-migration',
        },
        categories: [
          {
            items: prisonFilterTags,
          },
          {
            items: fromDateFilterTags,
          },
          {
            items: toDateFilterTags,
          },
          {
            items: failedFilterTags,
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter(
    'toIncentivesMigrationsListFilter',
    (filterOptionsHtml: string, migrationViewFilter: MigrationViewFilter) => {
      const hrefBase = '/incentives-migration?'
      const toDateFilterTags = getToDateFilterTags(migrationViewFilter, hrefBase)
      const fromDateFilterTags = getFromDateFilterTags(migrationViewFilter, hrefBase)
      const failedFilterTags = getFailedFilterTags(migrationViewFilter, hrefBase)

      return {
        heading: {
          text: 'Filter',
        },
        selectedFilters: {
          heading: {
            text: 'Selected filters',
          },
          clearLink: {
            text: 'Clear filters',
            href: '/incentivess-migration',
          },
          categories: [
            {
              items: fromDateFilterTags,
            },
            {
              items: toDateFilterTags,
            },
            {
              items: failedFilterTags,
            },
          ],
        },
        optionsHtml: filterOptionsHtml,
      }
    },
  )

  njkEnv.addFilter('prisonSearchInput', (migrationViewFilter: VisitsMigrationViewFilter) => {
    return {
      label: {
        text: 'Prison search',
        classes: 'govuk-label--m',
      },
      id: 'prisonId',
      name: 'prisonId',
      hint: {
        text: 'Search for a prison by code',
      },
      value: migrationViewFilter?.prisonId,
    }
  })

  njkEnv.addFilter('toDateInput', (migrationViewFilter: MigrationViewFilter, error: string) => {
    return {
      label: {
        text: 'To date',
        classes: 'govuk-label--m',
      },
      id: 'toDateTime',
      name: 'toDateTime',
      hint: {
        text: 'Only include migrations from before this date. Example 2020-03-28T12:00:00',
      },
      value: migrationViewFilter?.toDateTime,
      errorMessage: error,
    }
  })

  njkEnv.addFilter('fromDateInput', (migrationViewFilter: MigrationViewFilter, error: string) => {
    return {
      label: {
        text: 'From date',
        classes: 'govuk-label--m',
      },
      id: 'fromDateTime',
      name: 'fromDateTime',
      hint: {
        text: 'Only include migrations from after this date. Example 2020-03-28T12:00:00',
      },
      value: migrationViewFilter?.fromDateTime,
      errorMessage: error,
    }
  })

  njkEnv.addFilter('failedOnlyCheckbox', (migrationViewFilter: MigrationViewFilter) => {
    return {
      idPrefix: 'includeOnlyFailures',
      name: 'includeOnlyFailures',
      items: [
        {
          value: 'true',
          checked: migrationViewFilter?.includeOnlyFailures,
          text: 'Only include migrations with failures',
        },
      ],
    }
  })

  function getPrisonFilterTags(migrationViewFilter: VisitsMigrationViewFilter, hrefBase: string) {
    const { prisonId, ...newFilter }: ParsedUrlQueryInput = migrationViewFilter
    if (prisonId) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: `prison id: ${migrationViewFilter.prisonId}`,
        },
      ]
    }
    return undefined
  }

  function getToDateFilterTags(migrationViewFilter: MigrationViewFilter, hrefBase: string) {
    const { toDateTime, ...newFilter }: ParsedUrlQueryInput = migrationViewFilter
    if (toDateTime) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: `to date: ${migrationViewFilter.toDateTime}`,
        },
      ]
    }
    return undefined
  }

  function getFromDateFilterTags(migrationViewFilter: MigrationViewFilter, hrefBase: string) {
    const { fromDateTime, ...newFilter }: ParsedUrlQueryInput = migrationViewFilter
    if (fromDateTime) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: `from date: ${migrationViewFilter.fromDateTime}`,
        },
      ]
    }
    return undefined
  }

  function getFailedFilterTags(migrationViewFilter: MigrationViewFilter, hrefBase: string) {
    const { includeOnlyFailures, ...newFilter }: ParsedUrlQueryInput = migrationViewFilter
    if (includeOnlyFailures) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: `failures only`,
        },
      ]
    }
    return undefined
  }

  return njkEnv
}
