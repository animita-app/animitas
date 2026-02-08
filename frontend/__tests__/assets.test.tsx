import { render, screen } from "@testing-library/react";
import AssetsPage from "@/app/assets/page";

describe("Assets Page", () => {
  it("renders the assets gallery", () => {
    render(<AssetsPage />);
    expect(screen.getByText("Assets")).toBeInTheDocument();
    expect(screen.getByText("Portfolio and presentation media.")).toBeInTheDocument();
  });
});
