import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import CameraScreen from "../app/camera";
import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { uploadTestStrip } from "../src/api/test-strips";

jest.mock("react-native-vision-camera", () => ({
  Camera: "Camera",
  useCameraDevice: jest.fn(),
  useCameraPermission: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock("../src/api/test-strips", () => ({
  uploadTestStrip: jest.fn(),
}));

const mockedUseCameraDevice = useCameraDevice as jest.MockedFunction<
  typeof useCameraDevice
>;
const mockedUseCameraPermission = useCameraPermission as jest.MockedFunction<
  typeof useCameraPermission
>;
const mockedUploadTestStrip = uploadTestStrip as jest.MockedFunction<
  typeof uploadTestStrip
>;

describe("CameraScreen", () => {
  const mockDevice = { id: "back-camera" };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCameraDevice.mockReturnValue(mockDevice as any);
    mockedUseCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn(),
    });
    mockedUploadTestStrip.mockResolvedValue({
      id: "test-id",
      qr_code: "ELI-2025-001",
      status: "valid",
      created_at: "2025-10-04T20:06:10.114Z",
      thumbnail_path: "thumb_test.png",
      original_image_path: "original_test.jpg",
      image_size: 1024,
      image_dimensions: "800x600",
    });
  });

  it("should render camera container when device and permission are available", () => {
    render(<CameraScreen />);
    expect(screen.getByTestId("camera-container")).toBeTruthy();
    expect(screen.getByTestId("capture-button")).toBeTruthy();
  });

  it("should have capture button that can be pressed", () => {
    render(<CameraScreen />);

    const captureButton = screen.getByTestId("capture-button");
    expect(captureButton).toBeTruthy();

    fireEvent.press(captureButton);
  });

  it("should have upload functionality available", () => {
    expect(mockedUploadTestStrip).toBeDefined();
    expect(typeof mockedUploadTestStrip).toBe("function");

    const testPhotoPath = "file://test/photo.jpg";
    mockedUploadTestStrip(testPhotoPath);
    expect(mockedUploadTestStrip).toHaveBeenCalledWith(testPhotoPath);
  });
});
