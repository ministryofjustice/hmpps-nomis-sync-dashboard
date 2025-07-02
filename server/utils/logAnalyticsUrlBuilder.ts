import moment from 'moment/moment'

import config from '../config'
import { gzipBase64AndEncode } from './utils'

const urlWithQuery = (query: string) => {
  const resource = encodeURIComponent(
    `/subscriptions/${config.applicationInsights.subscriptId}/resourcegroups/${
      config.applicationInsights.resourceGroup
    }/providers/microsoft.operationalinsights/workspaces/${config.applicationInsights.component}`,
  )

  return `${config.applicationInsights.url}/#blade/Microsoft_OperationsManagementSuite_Workspace/Logs.ReactView/resourceId/${
    resource
  }/source/LogsBlade.AnalyticsShareLinkToQuery/q/${gzipBase64AndEncode(query)}`
}

export const buildUrl = (query: string, timespan = 'PT30M') => `${urlWithQuery(query)}/timespan/${timespan}/limit/1000`

export const buildUrlNoTimespan = (query: string) => `${urlWithQuery(query)}/limit/1000`

export const alreadyMigratedLogAnalyticsLink = (
  messageSnippet: string,
  startedDate: string,
  endedDate: string,
): string =>
  buildUrlNoTimespan(
    `AppTraces
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Message contains '${messageSnippet}'
| where TimeGenerated between (datetime(${toISODateTime(startedDate)}) .. datetime(${toISODateTime(endedDate)}))
| summarize dcount(Message)`,
  )

export const messageLogAnalyticsLink = (message: { messageId: string }): string =>
  buildUrl(
    `AppExceptions
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Properties.["Logger Message"] == "MessageID:${message.messageId}"
| order by TimeGenerated desc`,
    'P1D',
  )

export const migrationsLogAnalyticsLink = (
  eventPrefix: string,
  migrationId: string,
  startedDate: string,
  endedDate?: string,
  failed: boolean = false,
): string => {
  const startDateQuery = `datetime(${toISODateTime(startedDate)})`
  const endDateQuery = endedDate ? `datetime(${toISODateTime(endedDate)})` : `now()`
  const failedQuery = failed ? '| where (Name endswith "failed" or Name endswith "error")' : ''
  return buildUrlNoTimespan(`AppEvents
      | where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
      | where TimeGenerated between (${startDateQuery} .. ${endDateQuery})
      | where Properties.migrationId startswith '${migrationId}'
      | where Name startswith '${eventPrefix}-migration'
      ${failedQuery}`)
}

const toISODateTime = (localDateTime: string): string => moment(localDateTime).toISOString()
