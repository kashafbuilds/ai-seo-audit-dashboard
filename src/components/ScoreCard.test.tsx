import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScoreCard from "./ScoreCard";

describe("ScoreCard", () => {
  it("renders the score and label correctly", () => {
    render(<ScoreCard title="Overall Score" score={85} />);

    expect(screen.getByText("Overall Score")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Overall Score: 85 out of 100")
    ).toBeInTheDocument();
    expect(screen.getByText("out of 100")).toBeInTheDocument();
  });
});