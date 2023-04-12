import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type PageAdjustmentIdResponse = components['schemas']['PageAdjustmentIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
export type GetAdjustmentsByFilter = Omit<operations['getAdjustmentsByFilter']['parameters']['query'], 'pageRequest'>
export type VisitRoomCountResponse = components['schemas']['VisitRoomCountResponse']
