import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import Index from "../app/index";
import { getTestStrips, SubmissionData } from "../src/api/test-strips";
import { router } from "expo-router";

jest.mock("../src/api/test-strips", () => ({
  getTestStrips: jest.fn(),
}));

const mockedGetTestStrips = getTestStrips as jest.MockedFunction<
  typeof getTestStrips
>;
const mockedRouter = router as jest.Mocked<typeof router>;

describe("History screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTestStrips.mockResolvedValue({
      data: [
        {
          id: "663a4618-27c3-4de1-93c8-02cc1028c480",
          qr_code: "ELI-2025-001",
          status: "valid",
          created_at: "2025-10-04T20:06:10.114Z",
          thumbnail_path: "thumb_1759608370104.png",
          original_image_path: "original1.jpg",
          image_size: 1024,
          image_dimensions: "800x600",
        },
      ] as SubmissionData[],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        total_pages: 1,
      },
    });
  });

  it("should render the submissions list", async () => {
    render(<Index />);

    expect(screen.getByTestId("submissions-list")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Valid Test Strip 1")).toBeTruthy();
    });
  });

  it("should navigate to camera when camera button is pressed", () => {
    render(<Index />);

    const cameraFab = screen.getByTestId("camera-fab");
    fireEvent.press(cameraFab);

    expect(mockedRouter.push).toHaveBeenCalledWith("/camera");
  });

  it("should navigate to details when submission item is pressed", async () => {
    render(<Index />);

    await waitFor(() => {
      const submission = screen.getByText("Valid Test Strip 1");
      fireEvent.press(submission);
    });

    expect(mockedRouter.push).toHaveBeenCalledWith(
      "/details?id=663a4618-27c3-4de1-93c8-02cc1028c480"
    );
  });
});
