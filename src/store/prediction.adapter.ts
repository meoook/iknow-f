import { createEntityAdapter } from '@reduxjs/toolkit'
import type { IPrediction } from '../types/app.types'

export const predictionAdapter = createEntityAdapter<IPrediction>({
  sortComparer: (a, b) => b.created - a.created,
})

export const predictionSelectors = predictionAdapter.getSelectors()
