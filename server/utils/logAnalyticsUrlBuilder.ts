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
