import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DropZone from '../components/DropZone'

describe('DropZone', () => {
  it('renders instructions', () => {
    render(<DropZone onFile={() => {}} />)
    expect(screen.getByText(/Solte seu documento aqui/i)).toBeTruthy()
  })
})
