import config from '../config'

const buildUrl = (query: string, timespan = 'PT30M') => {
  const resource = encodeURIComponent(
    `/subscriptions/${config.applicationInsights.subscriptId}/resourceGroups/${config.applicationInsights.resourceGroup}/providers/Microsoft.Insights/components/${config.applicationInsights.component}`
  )
  return `${
    config.applicationInsights.url
  }/resourceId/${resource}/source/LogsBlade.AnalyticsShareLinkToQuery/query/${encodeURIComponent(
    query
  )}/timespan/${timespan}`
}

export default buildUrl
