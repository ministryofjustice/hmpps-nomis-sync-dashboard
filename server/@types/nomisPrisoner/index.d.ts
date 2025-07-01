import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type PageAdjustmentIdResponse = components['schemas']['PageAdjustmentIdResponse']
export type PagePrisonerId = components['schemas']['PagePrisonerId']
export type PageIncidentIdResponse = components['schemas']['PageIncidentIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAdjustmentsByFilter = Omit<operations['getAdjustmentsByFilter']['parameters']['query'], 'pageRequest'>
export type GetCourtCaseIdsByFilter = Omit<operations['getCourtCaseIdsByFilter']['parameters']['query'], 'pageRequest'>
export type GetIncidentIdsByFilter = Omit<operations['getIncidentIdsByFilter']['parameters']['query'], 'pageRequest'>
export type GetActivitiesByFilter = Omit<operations['findActiveActivities']['parameters']['query'], 'pageRequest'>
export type GetAllocationsByFilter = Omit<operations['findActiveAllocations']['parameters']['query'], 'pageRequest'>
export type VisitRoomCountResponse = components['schemas']['VisitRoomCountResponse']
export type IncentiveLevel = components['schemas']['IncentiveLevel']
export type PageActivitiesIdResponse = components['schemas']['PageFindActiveActivityIdsResponse']
export type PageAllocationsIdResponse = components['schemas']['PageFindActiveAllocationIdsResponse']
export type FindSuspendedAllocationsResponse = components['schemas']['FindSuspendedAllocationsResponse']
export type FindAllocationsMissingPayBandsResponse = components['schemas']['FindAllocationsMissingPayBandsResponse']
export type FindPayRateWithUnknownIncentiveResponse = components['schemas']['FindPayRateWithUnknownIncentiveResponse']
export type FindActivitiesWithoutScheduleRulesResponse = components['schemas']['FindActivitiesWithoutScheduleRules']
export type AppointmentCountsResponse = components['schemas']['AppointmentCountsResponse']
export type PageCourtCaseIdResponse = components['schemas']['PageCourtCaseIdResponse']
export type PagePersonIdResponse = components['schemas']['PagePersonIdResponse']
export type PagePrisonerRestrictionIdResponse = components['schemas']['PagePrisonerRestrictionIdResponse']
export type GetContactPersonByFilter = Omit<operations['getPersonIds']['parameters']['query'], 'pageRequest'>
export type GetPrisonerRestrictionByFilter = Omit<
  operations['getPrisonerRestrictionIds']['parameters']['query'],
  'pageRequest'
>
export type PageCorporateOrganisationIdResponse = components['schemas']['PageCorporateOrganisationIdResponse']
export type GetCorporateByFilter = Omit<operations['getCorporateIds']['parameters']['query'], 'pageRequest'>
export type PageVisitBalanceIdResponse = components['schemas']['PageVisitBalanceIdResponse']
export type GetVisitBalanceIdsByFilter = Omit<operations['findVisitBalanceIds']['parameters']['query'], 'pageRequest'>
