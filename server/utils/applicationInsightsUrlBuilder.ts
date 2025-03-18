import config from '../config'

export const buildUrl = (query: string, timespan = 'PT30M') => {
  const resource = encodeURIComponent(
    `/subscriptions/${config.applicationInsights.subscriptId}/resourceGroups/${config.applicationInsights.resourceGroup}/providers/Microsoft.Insights/components/${config.applicationInsights.component}`,
  )
  return `${
    config.applicationInsights.url
  }/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/${resource}/source/LogsBlade.AnalyticsShareLinkToQuery/query/${encodeURIComponent(
    query,
  )}/timespan/${timespan}`
}

export const buildUrlNoTimespan = (query: string) => {
  const resource = encodeURIComponent(
    `/subscriptions/${config.applicationInsights.subscriptId}/resourceGroups/${config.applicationInsights.resourceGroup}/providers/Microsoft.Insights/components/${config.applicationInsights.component}`,
  )
  return `${
    config.applicationInsights.url
  }/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/${resource}/source/LogsBlade.AnalyticsShareLinkToQuery/query/${encodeURIComponent(query)}`
}
