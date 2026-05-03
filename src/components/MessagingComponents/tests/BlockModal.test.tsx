import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BlockUserModal } from "@/components/UI/BlockModal"
import * as conversationApi from "@/services/api/messaging/conversationApi"

vi.mock("../../services/api/messaging/conversationApi", () => ({
  blockUser: vi.fn(),
  submitReport: vi.fn(),
}))

vi.mock("../MessagingComponents/CheckBox", () => ({
  default: ({
    label,
    checked,
    onChange,
  }: {
    label: string
    checked: boolean
    onChange: (v: boolean) => void
  }) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  ),
}))

const mockBlockUser   = vi.mocked(conversationApi.blockUser)
const mockSubmitReport = vi.mocked(conversationApi.submitReport)

const defaultProps = {
  username: "testuser",
  userId: "user-123",
  onClose: vi.fn(),
  onBlocked: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("BlockUserModal", () => {
  it("renders modal with username", () => {
    render(<BlockUserModal {...defaultProps} />)
    expect(screen.getByTestId("block-user-modal")).toBeInTheDocument()
    expect(screen.getByText("Block testuser")).toBeInTheDocument()
  })

  it("renders all blocking consequence list items", () => {
    render(<BlockUserModal {...defaultProps} />)
    expect(screen.getByText("follow you,")).toBeInTheDocument()
    expect(screen.getByText("like your tracks,")).toBeInTheDocument()
    expect(screen.getByText("repost your tracks,")).toBeInTheDocument()
    expect(screen.getByText("send you messages,")).toBeInTheDocument()
    expect(screen.getByText("share tracks with you,")).toBeInTheDocument()
    expect(screen.getByText("post new comments on your tracks, or")).toBeInTheDocument()
    expect(screen.getByText("send you new stream or email notifications.")).toBeInTheDocument()
  })

  it("renders checkboxes with correct labels", () => {
    render(<BlockUserModal {...defaultProps} />)
    expect(
      screen.getByText(
        "Also permanently remove this user's comments, reposts and likes of your tracks and playlists"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("Also report testuser for spam")
    ).toBeInTheDocument()
  })

  it("renders cancel and block buttons", () => {
    render(<BlockUserModal {...defaultProps} />)
    expect(screen.getByTestId("block-cancel-button")).toBeInTheDocument()
    expect(screen.getByTestId("block-user-button")).toBeInTheDocument()
    expect(screen.getByTestId("block-user-button")).toHaveTextContent("Block testuser")
  })

  it("calls onClose when cancel is clicked", () => {
    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-cancel-button"))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it("calls blockUser with userId and then onBlocked/onClose on success (data shape)", async () => {
    const blockData = { blocker_id: "me", blocked_id: "user-123", created_at: "2024-01-01" }
    mockBlockUser.mockResolvedValueOnce({ data: blockData } as any)

    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-user-button"))

    await waitFor(() => {
      expect(mockBlockUser).toHaveBeenCalledWith("user-123")
      expect(defaultProps.onBlocked).toHaveBeenCalledWith(blockData)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it("calls onBlocked with fallback shape when response has no data field", async () => {
    mockBlockUser.mockResolvedValueOnce({} as any)

    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-user-button"))

    await waitFor(() => {
      expect(defaultProps.onBlocked).toHaveBeenCalledWith({
        blocker_id: "",
        blocked_id: "user-123",
        created_at: "",
      })
    })
  })

  it("also calls submitReport when reportSpam checkbox is checked", async () => {
    mockBlockUser.mockResolvedValueOnce({} as any)
    mockSubmitReport.mockResolvedValueOnce(undefined as any)

    render(<BlockUserModal {...defaultProps} />)

    const checkboxes = screen.getAllByRole("checkbox")
    // second checkbox is "report spam"
    fireEvent.click(checkboxes[1])
    fireEvent.click(screen.getByTestId("block-user-button"))

    await waitFor(() => {
      expect(mockSubmitReport).toHaveBeenCalledWith({
        resource_type: "user",
        resource_id: "user-123",
        reason: "spam",
      })
    })
  })

  it("does NOT call submitReport when reportSpam checkbox is unchecked", async () => {
    mockBlockUser.mockResolvedValueOnce({} as any)

    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-user-button"))

    await waitFor(() => {
      expect(mockSubmitReport).not.toHaveBeenCalled()
    })
  })

  it("shows 401 error message when blockUser throws 401", async () => {
    mockBlockUser.mockRejectedValueOnce({ response: { status: 401 } })

    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-user-button"))

    await waitFor(() => {
      expect(screen.getByText("Missing or invalid access token.")).toBeInTheDocument()
    })
  })

  it("disables buttons while loading", async () => {
    let resolve: (v: any) => void
    mockBlockUser.mockReturnValueOnce(new Promise((r) => { resolve = r }))

    render(<BlockUserModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("block-user-button"))

    expect(screen.getByTestId("block-cancel-button")).toBeDisabled()
    expect(screen.getByTestId("block-user-button")).toBeDisabled()

    resolve!({})
  })

  it("does nothing if userId is missing", async () => {
    render(<BlockUserModal {...defaultProps} userId={undefined} />)
    fireEvent.click(screen.getByTestId("block-user-button"))
    await waitFor(() => {
      expect(mockBlockUser).not.toHaveBeenCalled()
    })
  })
})
