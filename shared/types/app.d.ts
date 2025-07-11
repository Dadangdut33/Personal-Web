export interface QueryBuilderParams<T extends LucidModel> {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  preload?: ExtractModelRelations<InstanceType<T>>[]
  filters?: Partial<ModelAttributes<InstanceType<T>>>
  noPagination?: boolean
  searchRelations?: {
    relation: ExtractModelRelations<InstanceType<T>>
    columns: string[]
  }[]
}
