import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type PageAdjustmentIdResponse = components['schemas']['PageAdjustmentIdResponse']
export type PageAlertIdResponse = components['schemas']['PageAlertIdResponse']
export type PageIncidentIdResponse = components['schemas']['PageIncidentIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAdjustmentsByFilter = Omit<operations['getAdjustmentsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAlertIdsByFilter = Omit<operations['getAlertIdsByFilter']['parameters']['query'], 'pageRequest'>
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
export type AppointmentCountsResponse = components['schemas']['AppointmentCountsResponse']
