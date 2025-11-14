import { BaseAPIResponse } from '#types/api'

import { router } from '@inertiajs/react'
import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query'
import axios, { AxiosError, Method } from 'axios'
import { NotifyError, NotifySuccess } from '~/components/core/notify'

export function useGenericMutation<
  TData = any,
  TResponse extends BaseAPIResponse = BaseAPIResponse,
>(
  method: Method,
  url: string,
  options?: UseMutationOptions<TResponse, AxiosError<TResponse>, TData>
): UseMutationResult<TResponse, AxiosError<TResponse>, TData> {
  return useMutation({
    mutationFn: async (data: TData): Promise<TResponse> => {
      const res = await axios.request<TResponse>({
        method,
        url,
        data,
      })
      return res.data
    },

    onSuccess: (res, variables, results, context) => {
      console.log(res)
      if (res.status === 'success') {
        NotifySuccess('Success', res.message)
      } else {
        console.error(res)
        NotifyError('Error', res.message)
      }

      options?.onSuccess?.(res, variables, results, context)
      if (res.status === 'success' && res.redirect_to) router.visit(res.redirect_to)
    },

    // Some error might not get onto onError, so we need to handle it here
    onSettled(_data, error, variables, results, context) {
      if (error?.response) {
        console.error(error)
        NotifyError('Error', error.response?.data.message || error.message)
        options?.onError?.(error, variables, results, context)
      }
    },

    onError: (error, variables, results, context) => {
      console.error(error)
      NotifyError('Error', error.response?.data.message || error.message)
      options?.onError?.(error, variables, results, context)
    },

    ...options,
  })
}
