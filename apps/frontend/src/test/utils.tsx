import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';
import { store } from '@/app/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...renderOptions }: ExtendedRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  return {
    store,
    ...render(ui, {
      wrapper: AllProviders,
      ...renderOptions,
    }),
  };
}

export * from '@testing-library/react';
export { renderWithProviders as render };
