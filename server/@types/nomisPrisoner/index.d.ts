import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type PageAdjustmentIdResponse = components['schemas']['PageAdjustmentIdResponse']
export type PageAdjudicationIdResponse = components['schemas']['PageAdjudicationChargeIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAdjustmentsByFilter = Omit<operations['getAdjustmentsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAdjudicationChargeIdsByFilter = Omit<
  operations['getAdjudicationChargeIdsByFilter']['parameters']['query'],
  'pageRequest'
>
export type GetActivitiesByFilter = Omit<operations['findActiveActivities']['parameters']['query'], 'pageRequest'>
export type GetAllocationsByFilter = Omit<operations['findActiveAllocations']['parameters']['query'], 'pageRequest'>
export type VisitRoomCountResponse = components['schemas']['VisitRoomCountResponse']
export type IncentiveLevel = components['schemas']['IncentiveLevel']
export type PageActivitiesIdResponse = components['schemas']['PageFindActiveActivityIdsResponse']
export type PageAllocationsIdResponse = components['schemas']['PageFindActiveAllocationIdsResponse']
export type FindSuspendedAllocationsResponse = components['schemas']['FindSuspendedAllocationsResponse']
export type FindAllocationsMissingPayBandsResponse = components['schemas']['FindAllocationsMissingPayBandsResponse']
export type FindPayRateWithUnknownIncentiveResponse = components['schemas']['FindPayRateWithUnknownIncentiveResponse']
