import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../redux/authSlice'

export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any
}

export const renderWithRedux = (
  ui: ReactElement,
  { initialState = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const store = createTestStore(initialState)
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store
  }
}

export * from '@testing-library/react'
export { renderWithRedux as render }

