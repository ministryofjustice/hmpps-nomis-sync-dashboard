/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import moment from 'moment'
import querystring, { ParsedUrlQueryInput } from 'querystring'
import fs from 'fs'
import { initialiseName } from './utils'
import config from '../config'
import logger from '../../logger'
import { Error } from '../validation/validation'
import { MigrationViewFilter } from '../@types/dashboard'

export default function nunjucksSetup(app: express.Express): nunjucks.Environment {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'NOMIS Migration and Synchronisation Dashboard'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

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
    'toSentencingMigrationsListFilter',
    (filterOptionsHtml: string, migrationViewFilter: MigrationViewFilter) => {
      const hrefBase = '/sentencing-migration?'
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
            href: '/sentencing-migration',
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

  njkEnv.addFilter('prisonSearchInput', (migrationViewFilter: MigrationViewFilter) => {
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

  function getPrisonFilterTags(migrationViewFilter: MigrationViewFilter, hrefBase: string) {
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
