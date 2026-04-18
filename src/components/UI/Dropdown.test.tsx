import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dropdown from "./Dropdown";

describe("Dropdown", () => {
  it("shows the header and filtered options when opened", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        label="Genre"
        value=""
        options={["Electronic", "Hip-hop"]}
        onChange={() => {}}
        headerText="All music genres"
      />,
    );

    await user.click(screen.getByTestId("dropdown-input"));

    expect(screen.getByText("All music genres")).toBeInTheDocument();
    expect(screen.getByText("Electronic")).toBeInTheDocument();
    expect(screen.getByText("Hip-hop")).toBeInTheDocument();
  });

  it("shows a no-results state when the search term filters everything out", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        label="Genre"
        value=""
        options={["Electronic", "Hip-hop"]}
        onChange={() => {}}
      />,
    );

    const input = screen.getByTestId("dropdown-input");
    await user.click(input);
    await user.type(input, "zzz");

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it("calls onChange and closes after selecting an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Dropdown
        label="Genre"
        value=""
        options={["Electronic", "Hip-hop"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByTestId("dropdown-input"));
    await user.click(screen.getByText("Electronic"));

    expect(onChange).toHaveBeenCalledWith("Electronic");
    expect(screen.queryByText("Electronic")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        label="Genre"
        value=""
        options={["Electronic", "Hip-hop"]}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByTestId("dropdown-input"));
    expect(screen.getByText("Electronic")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Electronic")).not.toBeInTheDocument();
  });

  it("syncs the search term when the value prop changes", () => {
    const { rerender } = render(
      <Dropdown
        label="Genre"
        value="Rock"
        options={["Rock", "Pop"]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId("dropdown-input")).toHaveValue("Rock");

    rerender(
      <Dropdown
        label="Genre"
        value="Jazz"
        options={["Rock", "Pop"]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId("dropdown-input")).toHaveValue("Jazz");
  });
});
