import { components, operations } from '../nomisPrisonerImport'

export type PageVisitIdResponse = components['schemas']['PageVisitIdResponse']
export type GetVisitsByFilter = Pick<
  operations['getVisitsByFilter']['parameters']['query'],
  'fromDateTime' | 'toDateTime' | 'prisonIds' | 'visitTypes'
>
