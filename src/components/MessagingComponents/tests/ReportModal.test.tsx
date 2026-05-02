import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ReportModal } from "@/components/UI/ReportModal"
import * as externalHandler from "@/components/MessagingComponents/externalhandler"

vi.mock("@/components/MessagingComponents/externalhandler", () => ({
  handleExternalAbuse:        vi.fn(),
  handleExternalImpersonation: vi.fn(),
  handleExternalOther:        vi.fn(),
  handleExternalTrademark:    vi.fn(),
}))

const defaultProps = {
  username: "reportuser",
  userId: "user-789",
  onClose: vi.fn(),
  onSpamSelected: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("ReportModal", () => {
  it("renders the modal with correct test id", () => {
    render(<ReportModal {...defaultProps} />)
    expect(screen.getByTestId("report-account-modal")).toBeInTheDocument()
  })

  it("renders the title", () => {
    render(<ReportModal {...defaultProps} />)
    expect(screen.getByText("Report account for")).toBeInTheDocument()
  })

  it("renders all report reason buttons", () => {
    render(<ReportModal {...defaultProps} />)
    expect(screen.getByTestId("report-spam-button")).toBeInTheDocument()
    expect(screen.getByTestId("report-impersonation-button")).toBeInTheDocument()
    expect(screen.getByTestId("report-abuse-button")).toBeInTheDocument()
    expect(screen.getByTestId("report-trademark-button")).toBeInTheDocument()
    expect(screen.getByTestId("report-other-button")).toBeInTheDocument()
  })

  it("renders correct label text on each button", () => {
    render(<ReportModal {...defaultProps} />)
    expect(screen.getByTestId("report-spam-button")).toHaveTextContent("Spam")
    expect(screen.getByTestId("report-impersonation-button")).toHaveTextContent("Impersonation")
    expect(screen.getByTestId("report-abuse-button")).toHaveTextContent("Abuse")
    expect(screen.getByTestId("report-trademark-button")).toHaveTextContent("Trademark infringement")
    expect(screen.getByTestId("report-other-button")).toHaveTextContent("Other")
  })

  it("calls onClose and onSpamSelected when Spam is clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-spam-button"))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSpamSelected).toHaveBeenCalledTimes(1)
  })

  it("calls handleExternalImpersonation when Impersonation is clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-impersonation-button"))
    expect(externalHandler.handleExternalImpersonation).toHaveBeenCalledTimes(1)
  })

  it("calls handleExternalAbuse when Abuse is clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-abuse-button"))
    expect(externalHandler.handleExternalAbuse).toHaveBeenCalledTimes(1)
  })

  it("calls handleExternalTrademark when Trademark infringement is clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-trademark-button"))
    expect(externalHandler.handleExternalTrademark).toHaveBeenCalledTimes(1)
  })

  it("calls handleExternalOther when Other is clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-other-button"))
    expect(externalHandler.handleExternalOther).toHaveBeenCalledTimes(1)
  })

  it("renders the Disclaimer section", () => {
    render(<ReportModal {...defaultProps} />)
    expect(screen.getByText("Disclaimer")).toBeInTheDocument()
  })

  it("renders the Guidelines link pointing to the correct URL", () => {
    render(<ReportModal {...defaultProps} />)
    const guidelinesLink = screen.getByRole("link", { name: "Guidelines" })
    expect(guidelinesLink).toHaveAttribute("href", "https://soundcloud.com/pages/privacy")
    expect(guidelinesLink).toHaveAttribute("target", "_blank")
    expect(guidelinesLink).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders the Terms link pointing to the correct URL", () => {
    render(<ReportModal {...defaultProps} />)
    const termsLink = screen.getByRole("link", { name: "Terms" })
    expect(termsLink).toHaveAttribute("href", "https://soundcloud.com/terms-of-use")
    expect(termsLink).toHaveAttribute("target", "_blank")
    expect(termsLink).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("does not call onClose when non-spam buttons are clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-abuse-button"))
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it("does not call onSpamSelected when non-spam buttons are clicked", () => {
    render(<ReportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId("report-other-button"))
    expect(defaultProps.onSpamSelected).not.toHaveBeenCalled()
  })
})
