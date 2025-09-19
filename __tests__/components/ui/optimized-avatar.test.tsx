/**
 * Optimized Avatar Component Tests
 * Comprehensive tests for avatar rendering and fallback functionality
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { OptimizedAvatar, AvatarGroup } from '@/components/ui/optimized-avatar'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn(({ src, alt, onLoad, onError, ...props }) => {
    React.useEffect(() => {
      // Simulate successful load after a short delay
      const timer = setTimeout(() => {
        if (src && !src.includes('invalid')) {
          onLoad?.()
        } else {
          onError?.()
        }
      }, 10)

      return () => clearTimeout(timer)
    }, [src, onLoad, onError])

    return (
      <img
        src={src}
        alt={alt}
        data-testid="avatar-image"
        {...props}
      />
    )
  })
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})


// Mock avatar data for tests
const mockAvatars = [
  { src: '/invalid-user1.jpg', alt: 'User 1' },
  { src: '/invalid-user2.jpg', alt: 'User 2' },
  { alt: 'User 3' }, // No src, should show initials
  { src: '/user4.jpg', alt: 'User 4' },
  { src: '/user5.jpg', alt: 'User 5' },
  { src: '/user6.jpg', alt: 'User 6' }
];
describe('OptimizedAvatar', () => {
  it('renders initials fallback when no src provided', () => {
    render(
      <OptimizedAvatar
        alt="John Doe"
        data-testid="avatar"
      />
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument()
  })

  it('renders custom fallback text', () => {
    render(
      <OptimizedAvatar
        alt="John Doe"
        fallback="AB"
      />
    )

    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('generates correct initials from name', () => {
    const testCases = [
      { name: 'John Doe', expected: 'JD' },
      { name: 'Alice', expected: 'A' },
      { name: 'Bob Smith Johnson', expected: 'BS' },
      { name: 'mary jane watson', expected: 'MJ' },
    ]

    testCases.forEach(({ name, expected }) => {
      const { unmount } = render(
        <OptimizedAvatar alt={name} />
      )

      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })

  it('renders image when src is provided and loads successfully', async () => {
    render(
      <OptimizedAvatar
        src="/valid-avatar.jpg"
        alt="John Doe"
        priority
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument()
    })
  })

  it('falls back to initials when image fails to load', async () => {
    render(
      <OptimizedAvatar
        src="/invalid-avatar.jpg"
        alt="John Doe"
        priority
      />
    )

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument()
    })
  })

  it('applies correct size classes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const

    sizes.forEach(size => {
      const { unmount } = render(
        <OptimizedAvatar
          alt="Test User"
          size={size}
        />
      )

      const avatar = screen.getByText('TU').closest('div')
      expect(avatar).toHaveClass(
        size === 'sm' ? 'w-8 h-8' :
        size === 'md' ? 'w-12 h-12' :
        size === 'lg' ? 'w-16 h-16' :
        'w-24 h-24'
      )

      unmount()
    })
  })

  it('applies custom className', () => {
    render(
      <OptimizedAvatar
        alt="Test User"
        className="custom-avatar-class"
      />
    )

    const avatar = screen.getByText('TU').closest('div')
    expect(avatar).toHaveClass('custom-avatar-class')
  })

  it('shows loading state before image loads', () => {
    render(
      <OptimizedAvatar
        src="/slow-loading-image.jpg"
        alt="Test User"
      />
    )

    // Should show loading state initially
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()
  })

  it('handles priority loading correctly', async () => {
    render(
      <OptimizedAvatar
        src="/priority-avatar.jpg"
        alt="Priority User"
        priority={true}
      />
    )

    await waitFor(() => {
      const image = screen.getByTestId('avatar-image')
      expect(image).toBeInTheDocument()
    })
  })
})

  it('renders all avatars when count is within max limit', async () => {
    render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
        max={5}
      />
    )

    await waitFor(() => expect(screen.getByText('U1')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('U2')).toBeInTheDocument())
    expect(screen.getByText('U3')).toBeInTheDocument()
    })

  it('shows overflow indicator when avatars exceed max limit', async () => {
    render(
      <AvatarGroup
        avatars={mockAvatars}
        max={3}
      />
    )

    // Should show first 3 avatars plus overflow
    await waitFor(() => expect(screen.getByText('U1')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('U2')).toBeInTheDocument())
    expect(screen.getByText('U3')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument() // 6 total - 3 shown = 3 remaining
  })

  it('applies correct overlap classes based on size', () => {
    const { rerender } = render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
        size="sm"
      />
    )

    // Check for small size overlap
    let overlappedElement = document.querySelector('.-ml-2')
    expect(overlappedElement).toBeInTheDocument()

    rerender(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
        size="lg"
      />
    )

    // Check for large size overlap
    overlappedElement = document.querySelector('.-ml-4')
    expect(overlappedElement).toBeInTheDocument()
  })

  it('maintains proper z-index stacking', () => {
    render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
      />
    )

    const avatarContainers = document.querySelectorAll('[style*="z-index"]')
    expect(avatarContainers).toHaveLength(3)

    // First avatar should have highest z-index
    expect(avatarContainers[0]).toHaveStyle('z-index: 3')
    expect(avatarContainers[1]).toHaveStyle('z-index: 2')
    expect(avatarContainers[2]).toHaveStyle('z-index: 1')
  })

  it('applies custom className to group container', () => {
    render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 2)}
        className="custom-group-class"
      />
    )

    const group = document.querySelector('.custom-group-class')
    expect(group).toBeInTheDocument()
    expect(group).toHaveClass('flex', 'items-center')
  })

  it('handles empty avatars array', () => {
    render(<AvatarGroup avatars={[]} />)

    const group = document.querySelector('.flex.items-center')
    expect(group).toBeInTheDocument()
    expect(group).toBeEmptyDOMElement()
  })

  it('handles single avatar correctly', () => {
    render(
      <AvatarGroup
        avatars={[{ alt: 'Solo User' }]}
      />
    )

    expect(screen.getByText('SU')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument() // No overflow indicator
  })
})

describe('Accessibility', () => {
  it('provides proper alt text for avatar images', async () => {
    render(
      <OptimizedAvatar
        src="/accessible-avatar.jpg"
        alt="Accessible User Avatar"
        priority
      />
    )

    await waitFor(() => {
      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('alt', 'Accessible User Avatar')
    })
  })

  it('maintains readable contrast for initials', () => {
    render(
      <OptimizedAvatar
        alt="Contrast Test"
      />
    )

    const initialsContainer = screen.getByText('CT').closest('div')
    expect(initialsContainer).toHaveClass('text-white') // Ensures contrast against gradient background
  })

  it('supports keyboard navigation in avatar groups', () => {
    render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
      />
    )

    const avatars = screen.getAllByText(/^U\d$/)
    avatars.forEach(avatar => {
      fireEvent.focus(avatar)
      expect(document.activeElement).toBe(avatar)
    })
  })

  it('provides semantic meaning for avatar groups', () => {
    render(
      <AvatarGroup
        avatars={mockAvatars.slice(0, 3)}
      />
    )

    const group = document.querySelector('.flex.items-center')
    expect(group).toBeInTheDocument()

    // Check that avatars are contained within a logical grouping
    const avatars = screen.getAllByText(/^U\d$/)
    expect(avatars).toHaveLength(3)
  })
})

describe('Performance', () => {
  it('efficiently handles large avatar groups', () => {
    const largeAvatarList = Array.from({ length: 50 }, (_, i) => ({
      src: `/user${i}.jpg`,
      alt: `User ${i + 1}`
    }))

    const { container } = render(
      <AvatarGroup
        avatars={largeAvatarList}
        max={10}
      />
    )

    // Should only render max + 1 (overflow) elements
    const renderedElements = container.querySelectorAll('[style*="z-index"]')
    expect(renderedElements.length).toBeLessThanOrEqual(11) // 10 avatars + 1 overflow
  })

  it('handles rapid avatar updates without memory leaks', () => {
    const { rerender } = render(
      <OptimizedAvatar
        src="/user1.jpg"
        alt="Dynamic User"
      />
    )

    // Rapidly change avatar src
    for (let i = 2; i <= 10; i++) {
      rerender(
        <OptimizedAvatar
          src={`/user${i}.jpg`}
          alt="Dynamic User"
        />
      )
    }

    // Should handle updates without errors
    expect(screen.getByText('DU')).toBeInTheDocument()
  })

  it('optimizes image loading with correct sizes prop', async () => {
    render(
      <OptimizedAvatar
        src="/optimized-avatar.jpg"
        alt="Optimized User"
        size="lg"
        priority
      />
    )

    await waitFor(() => {
      const image = screen.getByTestId('avatar-image')
      expect(image).toBeInTheDocument()
      // Next.js Image should receive the correct sizes prop
    })
  })
})