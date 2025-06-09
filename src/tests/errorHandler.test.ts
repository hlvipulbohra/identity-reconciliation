import { errorHandler } from "../middleware/errorHandler";

describe("errorHandler middleware", () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it("returns 500 Internal Server Error", () => {
    const mockReq = {} as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    const error = new Error("Internal Server Error");
    errorHandler(error, mockReq, mockRes as any, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      success: false,
    });
  });
});
