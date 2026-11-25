import { render, screen, fireEvent } from "@testing-library/react";
import { MapStatus } from "@/components/map/map-status";

describe("MapStatus", () => {
  it("says the animitas could not load and offers a retry", () => {
    const onRetry = jest.fn();
    render(<MapStatus status="error" count={0} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las animitas.");
    expect(screen.queryByText("se apagó")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("explains an empty map instead of showing nothing", () => {
    render(<MapStatus status="ready" count={0} onRetry={jest.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Nadie ha añadido una animita todavía.");
  });

  it("gets out of the way when there are animitas", () => {
    const { container } = render(<MapStatus status="ready" count={3} onRetry={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names the chosen place when it has no animitas", () => {
    render(<MapStatus status="ready" count={0} onRetry={() => {}} area="Región de Atacama" />);
    expect(screen.getByRole("status")).toHaveTextContent("Nadie ha añadido una animita en Región de Atacama.");
  });
});
