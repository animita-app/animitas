import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));
import { toast } from "sonner";
import { InlineEdit } from "@/components/ui/inline-edit";

describe("InlineEdit", () => {
  it("opens with the keyboard and saves on Enter", async () => {
    const onSave = jest.fn(async () => {});
    render(<InlineEdit value="Juanito" label="Nombre" onSave={onSave} />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Editar nombre" }), { key: "Enter" });
    const input = screen.getByRole("textbox", { name: "Nombre" });
    fireEvent.change(input, { target: { value: "Juanito Pérez " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Juanito Pérez"));
    expect(await screen.findByRole("button", { name: "Editar nombre" })).toHaveTextContent("Juanito Pérez");
  });

  it("keeps the old value and stays open when saving fails", async () => {
    const onSave = jest.fn(async () => { throw new Error("sin conexión"); });
    render(<InlineEdit value="Juanito" label="Nombre" onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nombre" }));
    const input = screen.getByRole("textbox", { name: "Nombre" });
    fireEvent.change(input, { target: { value: "Otro" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("Otro");
  });

  it("Escape discards the draft", () => {
    render(<InlineEdit value="Juanito" label="Nombre" onSave={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar nombre" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), { target: { value: "Otro" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Nombre" }), { key: "Escape" });
    expect(screen.getByRole("button", { name: "Editar nombre" })).toHaveTextContent("Juanito");
  });
});
