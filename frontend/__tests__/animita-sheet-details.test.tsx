import { render, screen } from "@testing-library/react";

jest.mock("@/contexts/user-context", () => ({ useUser: () => ({ currentUser: null, isEditor: false }) }));
jest.mock("@/app/animita/[slug]/sections/info-sidebar-components/velas", () => ({ Velas: () => <div>velas</div> }));
jest.mock("@/app/animita/[slug]/sections/info-sidebar-components/creator-section", () => ({ CreatorSection: () => <div>dónde está</div> }));
jest.mock("@/app/animita/[slug]/sections/info-sidebar-components/comments-section", () => ({ CommentsSection: () => <div>recuerdos</div> }));
jest.mock("@/lib/supabase/client", () => ({ createClient: jest.fn() }));

import { AnimitaDetails } from "@/app/animita/[slug]/sections/animita-details";

const story = "Murió en la curva del puente. La cuidan sus vecinos desde 1987. " + "Cada noviembre le traen flores y cartas, y la gente cuenta que concede favores a quien pasa de noche. ".repeat(5);
const site: any = { id: "1", slug: "maria", title: "María Márquez", story, images: null, location: { lat: -42, lng: -73 } };

describe("AnimitaDetails in the sheet", () => {
  it("tells only the start of the story and sends the rest to the full page", () => {
    render(<AnimitaDetails site={site} compact />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText(/^Murió en la curva del puente\. La cuidan sus vecinos desde 1987\./)).toBeInTheDocument();
    expect(screen.queryByText(story.trim())).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver ficha completa" })).toHaveAttribute("href", "/animita/maria");
    expect(screen.queryByText("recuerdos")).not.toBeInTheDocument();
  });

  it("keeps the recuerdos and the whole story on the full page", () => {
    render(<AnimitaDetails site={site} />);
    expect(screen.getByText("recuerdos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Animita de María Márquez" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver ficha completa" })).not.toBeInTheDocument();
  });
});
