import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type PageIncentiveIdResponse = components['schemas']['PageIncentiveIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
export type GetIncentivesByFilter = Omit<operations['getIncentivesByFilter']['parameters']['query'], 'pageRequest'>
