import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SpamModal } from "@/components/UI/SpamModal"
import * as conversationApi from "@/services/api/messaging/conversationApi"

vi.mock("@/services/api/messaging/conversationApi", () => ({
  blockUser: vi.fn(),
  submitReport: vi.fn(),
}))

const mockSubmitReport = vi.mocked(conversationApi.submitReport)

const defaultProps = {
  username: "spamuser",
  userId: "user-456",
  onClose: vi.fn(),
  onReported: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("SpamModal", () => {
  it("renders the modal with correct test id", () => {
    render(<SpamModal {...defaultProps} />)
    expect(screen.getByTestId("spam-report-modal")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(<SpamModal {...defaultProps} />)
    expect(screen.getByTestId("spam-report-title")).toHaveTextContent("Report Spam")
  })

  it("renders reporting username in description", () => {
    render(<SpamModal {...defaultProps} />)
    expect(screen.getByText("Reporting spamuser for spam:")).toBeInTheDocument()
  })

  it("renders all consequence list items", () => {
    render(<SpamModal {...defaultProps} />)
    expect(
      screen.getByText("Removes their comments, reposts and likes from your tracks and playlists")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Blocks them from interacting with you")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Sends SoundCloud a spam report")
    ).toBeInTheDocument()
  })

  it("renders cancel and report buttons", () => {
    render(<SpamModal {...defaultProps} />)
    expect(screen.getByTestId("spam-cancel-button")).toBeInTheDocument()
    expect(screen.getByTestId("spam-report-button")).toBeInTheDocument()
    expect(screen.getByTestId("spam-report-button")).toHaveTextContent("Report spam")
  })

  it("calls onClose when cancel is clicked", () => {
    render(<SpamModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("spam-cancel-button"))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it("calls submitReport, then onReported and onClose on success", async () => {
    mockSubmitReport.mockResolvedValueOnce(undefined as any)

    render(<SpamModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("spam-report-button"))

    await waitFor(() => {
      expect(mockSubmitReport).toHaveBeenCalledWith({
        resource_type: "user",
        resource_id: "user-456",
        reason: "spam",
      })
      expect(defaultProps.onReported).toHaveBeenCalledTimes(1)
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("shows 401 error message when submitReport throws 401", async () => {
    mockSubmitReport.mockRejectedValueOnce({ response: { status: 401 } })

    render(<SpamModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("spam-report-button"))

    await waitFor(() => {
      expect(screen.getByText("Missing or invalid access token.")).toBeInTheDocument()
    })
  })

  it("does not show error initially", () => {
    render(<SpamModal {...defaultProps} />)
    expect(screen.queryByText("Missing or invalid access token.")).not.toBeInTheDocument()
  })

  it("disables buttons while loading", async () => {
    let resolve: (v: any) => void
    mockSubmitReport.mockReturnValueOnce(new Promise((r) => { resolve = r }))

    render(<SpamModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("spam-report-button"))

    expect(screen.getByTestId("spam-cancel-button")).toBeDisabled()
    expect(screen.getByTestId("spam-report-button")).toBeDisabled()

    resolve!(undefined)
  })

  it("does nothing if userId is missing", async () => {
    render(<SpamModal {...defaultProps} userId={undefined} />)
    fireEvent.click(screen.getByTestId("spam-report-button"))
    await waitFor(() => {
      expect(mockSubmitReport).not.toHaveBeenCalled()
    })
  })
})
