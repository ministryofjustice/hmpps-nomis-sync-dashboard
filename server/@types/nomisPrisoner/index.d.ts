import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type GetVisitsByFilter = Omit<operations['getVisitsByFilter']['parameters']['query'], 'pageRequest'>
