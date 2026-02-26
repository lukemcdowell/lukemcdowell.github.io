import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import CurrentlyPlaying from "./CurrentlyPlaying";

const mockTrack = {
  isPlaying: true,
  type: "track",
  song: "Test Song",
  artist: "Test Artist",
  href: "https://open.spotify.com/track/123",
};

function mockFetch(data: object) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    json: () => Promise.resolve(data),
  } as Response);
}

describe("CurrentlyPlaying", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("PUBLIC_API_URL", "https://api.example.com");
    vi.stubEnv("PUBLIC_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("shows loading spinner while fetch is in-flight", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    render(<CurrentlyPlaying />);
    expect(
      screen.getByText("getting currently playing..."),
    ).toBeInTheDocument();
  });

  it('renders track and "currently listening to:" when isPlaying is true', async () => {
    mockFetch(mockTrack);
    render(<CurrentlyPlaying />);
    await act(async () => {});
    expect(screen.getByText(/currently listening to:/)).toBeInTheDocument();
    expect(screen.getByText("Test Song - Test Artist")).toBeInTheDocument();
  });

  it('renders "last listened to:" when isPlaying is false', async () => {
    mockFetch({ ...mockTrack, isPlaying: false });
    render(<CurrentlyPlaying />);
    await act(async () => {});
    expect(screen.getByText(/last listened to:/)).toBeInTheDocument();
  });

  it("renders nothing on fetch error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const { container } = render(<CurrentlyPlaying />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("falls back to mock data when API env vars are absent", async () => {
    vi.stubEnv("PUBLIC_API_URL", "");
    vi.stubEnv("PUBLIC_API_KEY", "");
    render(<CurrentlyPlaying />);
    await act(async () => {});
    expect(screen.getByText(/Radio Ga Ga/)).toBeInTheDocument();
  });
});
