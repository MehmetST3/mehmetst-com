import { render, screen, within } from '@testing-library/react'
import { App } from '../App'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('site footer', () => {
  it('contains only real page and contact links', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')

    expect(within(footer).getByRole('heading', { name: 'Mehmet Tüysüz' })).toBeVisible()
    expect(within(footer).getByRole('heading', { name: 'Sayfalar' })).toBeVisible()
    expect(within(footer).getByRole('heading', { name: 'Bağlantılar' })).toBeVisible()
    expect(within(footer).getByRole('link', { name: 'Hakkımda' })).toHaveAttribute('href', '/#hakkimda')
    expect(within(footer).getByRole('link', { name: 'Projeler' })).toHaveAttribute('href', '/#projeler')
    expect(within(footer).getByRole('link', { name: 'Devam eden çalışmalar' })).toHaveAttribute('href', '/#devam-eden')
    expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/MehmetST3')
    expect(within(footer).getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/mehmetstt0/?__pwa=1')
    expect(within(footer).getByRole('link', { name: 'E-posta' })).toHaveAttribute('href', 'mailto:tuysuzsiretmehmet@gmail.com')
    expect(within(footer).queryByText(/Gizlilik|Çerez|Koşullar|LinkedIn/i)).not.toBeInTheDocument()
    expect(within(footer).getByText('© 2026 Mehmet Tüysüz.')).toBeVisible()
  })
})
