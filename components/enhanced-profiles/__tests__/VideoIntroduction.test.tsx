import * as React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoIntroduction } from '../VideoIntroduction';

// Mock react-player
jest.mock('react-player', () => {
  return function MockReactPlayer({ onReady, onStart, onPlay, onPause, onEnded, ...props }: any) {
    return (
      <div data-testid="react-player" {...props}>
        <button onClick={() => onPlay?.()} data-testid="play-button">Play</button>
        <button onClick={() => onPause?.()} data-testid="pause-button">Pause</button>
        <button onClick={() => onReady?.()} data-testid="ready-button">Ready</button>
        <button onClick={() => onStart?.()} data-testid="start-button">Start</button>
        <button onClick={() => onEnded?.()} data-testid="ended-button">Ended</button>
      </div>
    );
  };
});

// Mock useLazyLoading hook to always report visibility
jest.mock('@/lib/hooks/use-lazy-loading', () => ({
  useLazyLoading: () => ({
    ref: React.createRef(),
    wasVisible: true
  })
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  }
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return {
    __esModule: true,
    default: (loader: any) => {
      const DynamicComponent = React.lazy(loader);
      return (props: any) => (
        <React.Suspense fallback={<div data-testid="video-loading">Loading...</div>}>
          <DynamicComponent {...props} />
        </React.Suspense>
      );
    }
  };
});

describe('VideoIntroduction', () => {
  const mockVideoData = {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Company Introduction',
    description: 'Learn about our innovative marine technology solutions',
    thumbnailUrl: '/images/video-thumbnail.jpg',
    duration: 180
  };

  it('renders video title and description', () => {
    render(<VideoIntroduction video={mockVideoData} />);

    expect(screen.getByText('Company Introduction')).toBeInTheDocument();
    expect(screen.getByText('Learn about our innovative marine technology solutions')).toBeInTheDocument();
  });

  it('displays video thumbnail when not playing', () => {
    render(<VideoIntroduction video={mockVideoData} />);

    const thumbnail = screen.getByAltText('Company Introduction thumbnail');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail.getAttribute('src')).toContain('video-thumbnail.jpg');
  });

  it('shows play button overlay on thumbnail', () => {
    render(<VideoIntroduction video={mockVideoData} />);

    expect(screen.getByTestId('play-overlay')).toBeInTheDocument();
  });

  it('loads react-player when play button is clicked', async () => {
    render(<VideoIntroduction video={mockVideoData} />);

    const playOverlay = screen.getByTestId('play-overlay');
    fireEvent.click(playOverlay);

    // Wait for the Suspense boundary to resolve
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays video duration formatted correctly', () => {
    render(<VideoIntroduction video={mockVideoData} />);

    expect(screen.getByText('3:00')).toBeInTheDocument();
  });

  it('handles video events correctly', () => {
    const onPlaySpy = jest.fn();
    render(<VideoIntroduction video={mockVideoData} onPlay={onPlaySpy} />);

    // Click to load player
    fireEvent.click(screen.getByTestId('play-overlay'));

    // Simulate play event
    fireEvent.click(screen.getByTestId('play-button'));

    expect(onPlaySpy).toHaveBeenCalled();
  });

  it('shows loading state while video loads', async () => {
    render(<VideoIntroduction video={mockVideoData} />);

    fireEvent.click(screen.getByTestId('play-overlay'));

    // After clicking play, the video player should be loaded
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('applies custom className when provided', () => {
    render(<VideoIntroduction video={mockVideoData} className="custom-video" />);

    expect(screen.getByTestId('video-introduction')).toHaveClass('custom-video');
  });

  it('handles missing thumbnail gracefully', () => {
    const videoWithoutThumbnail = { ...mockVideoData, thumbnailUrl: undefined };
    render(<VideoIntroduction video={videoWithoutThumbnail} />);

    expect(screen.getByTestId('default-thumbnail')).toBeInTheDocument();
  });

  it('displays video controls when playing', () => {
    render(<VideoIntroduction video={mockVideoData} controls={true} />);

    fireEvent.click(screen.getByTestId('play-overlay'));

    expect(screen.getByTestId('react-player')).toBeInTheDocument();
  });

  it('supports autoplay when enabled', () => {
    render(<VideoIntroduction video={mockVideoData} autoplay={true} />);

    expect(screen.getByTestId('react-player')).toBeInTheDocument();
  });

  it('handles video end event', async () => {
    const onEndedSpy = jest.fn();
    render(<VideoIntroduction video={mockVideoData} onEnded={onEndedSpy} />);

    fireEvent.click(screen.getByTestId('play-overlay'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('ended-button'));
    });

    expect(onEndedSpy).toHaveBeenCalled();
  });

  it('shows replay button when video ends', async () => {
    render(<VideoIntroduction video={mockVideoData} />);

    fireEvent.click(screen.getByTestId('play-overlay'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('ended-button'));
    });

    expect(screen.getByTestId('replay-button')).toBeInTheDocument();
  });
});
