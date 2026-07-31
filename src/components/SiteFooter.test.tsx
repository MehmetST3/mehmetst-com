import { render, screen, within } from '@testing-library/react'
import { getLocaleContent } from '../content'
import { SiteFooter } from './SiteFooter'

describe('localized site footer', () => {
  it('contains only real Turkish page and contact links', () => {
    render(<SiteFooter content={getLocaleContent('tr')} />)
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('heading', { name: 'Mehmet Tüysüz' })).toBeVisible()
    expect(within(footer).getByRole('link', { name: 'Hakkımda' })).toHaveAttribute('href', '/tr#hakkimda')
    expect(within(footer).getByRole('link', { name: 'Projeler' })).toHaveAttribute('href', '/tr#projeler')
    expect(within(footer).getByRole('link', { name: 'Devam eden çalışmalar' })).toHaveAttribute('href', '/tr#devam-eden')
    expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/MehmetST3')
    expect(within(footer).getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/mehmetstt0/?__pwa=1')
    expect(within(footer).getByRole('link', { name: 'E-posta' })).toHaveAttribute('href', 'mailto:tuysuzsiretmehmet@gmail.com')
    expect(within(footer).queryByText(/Gizlilik|Çerez|Koşullar|LinkedIn/i)).not.toBeInTheDocument()
  })

  it('localizes page and email labels in English', () => {
    render(<SiteFooter content={getLocaleContent('en')} />)
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en#about')
    expect(within(footer).getByRole('link', { name: 'Ongoing work' })).toHaveAttribute('href', '/en#ongoing')
    expect(within(footer).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:tuysuzsiretmehmet@gmail.com')
  })
})
