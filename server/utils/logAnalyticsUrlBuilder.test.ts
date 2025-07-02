import {
  alreadyMigratedLogAnalyticsLink,
  messageLogAnalyticsLink,
  migrationsLogAnalyticsLink,
} from './logAnalyticsUrlBuilder'
import decodeBase64AndGunzip from './utils.test'

describe('logAnalyticsUrlBuilder', () => {
  const urlPrefix =
    'http://localhost:8103/applicationinsights/#blade/Microsoft_OperationsManagementSuite_Workspace/Logs.ReactView/resourceId/%2Fsubscriptions%2Fsubscription%2Fresourcegroups%2Fcomponent-rg%2Fproviders%2Fmicrosoft.operationalinsights%2Fworkspaces%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/q/'

  describe('alreadyMigratedLogAnalyticsLink', () => {
    it('should create an app traces link', () => {
      const result = alreadyMigratedLogAnalyticsLink('hello', '2025-02-03T01:02:03', '2025-02-03T02:03:04')
      const limit = '/limit/1000'
      expect(result.substring(0, urlPrefix.length)).toEqual(urlPrefix)
      expect(result.substring(result.length - limit.length)).toEqual(limit)
      expect(decodeBase64AndGunzip(result.substring(urlPrefix.length, result.length - limit.length))).toEqual(
        `AppTraces
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Message contains 'hello'
| where TimeGenerated between (datetime(2025-02-03T01:02:03.000Z) .. datetime(2025-02-03T02:03:04.000Z))
| summarize dcount(Message)`,
      )
    })
  })

  describe('messageLogAnalyticsLink', () => {
    it('should create an app traces message link', () => {
      const result = messageLogAnalyticsLink({ messageId: '234' })
      const limit = '/timespan/P1D/limit/1000'
      expect(result.substring(0, urlPrefix.length)).toEqual(urlPrefix)
      expect(result.substring(result.length - limit.length)).toEqual(limit)
      expect(decodeBase64AndGunzip(result.substring(urlPrefix.length, result.length - limit.length))).toEqual(
        `AppExceptions
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Properties.["Logger Message"] == "MessageID:234"
| order by TimeGenerated desc`,
      )
    })
  })

  describe('migrationsLogAnalyticsLink', () => {
    it('should create an app traces link for all events', () => {
      const result = migrationsLogAnalyticsLink(
        'contactperson-profiledetails',
        'hello',
        '2025-02-03T01:02:03',
        '2025-02-03T02:03:04',
        false,
      )
      const limit = '/limit/1000'
      expect(result.substring(0, urlPrefix.length)).toEqual(urlPrefix)
      expect(result.substring(result.length - limit.length)).toEqual(limit)
      expect(decodeBase64AndGunzip(result.substring(urlPrefix.length, result.length - limit.length))).toEqual(
        `AppEvents
      | where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
      | where TimeGenerated between (datetime(2025-02-03T01:02:03.000Z) .. datetime(2025-02-03T02:03:04.000Z))
      | where Properties.migrationId startswith 'hello'
      | where Name startswith 'contactperson-profiledetails-migration'
      `,
      )
    })
    it('should create an app traces link for failed events', () => {
      const result = migrationsLogAnalyticsLink(
        'visitbalance',
        'hello',
        '2025-02-03T01:02:03',
        '2025-02-03T02:03:04',
        true,
      )
      const limit = '/limit/1000'
      expect(result.substring(0, urlPrefix.length)).toEqual(urlPrefix)
      expect(result.substring(result.length - limit.length)).toEqual(limit)
      expect(decodeBase64AndGunzip(result.substring(urlPrefix.length, result.length - limit.length))).toEqual(
        `AppEvents
      | where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
      | where TimeGenerated between (datetime(2025-02-03T01:02:03.000Z) .. datetime(2025-02-03T02:03:04.000Z))
      | where Properties.migrationId startswith 'hello'
      | where Name startswith 'visitbalance-migration'
      | where (Name endswith "failed" or Name endswith "error")`,
      )
    })
  })
})
