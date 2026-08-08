import { jest } from '@jest/globals';
import { ApiError, errorHandler } from '../middleware/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';

describe('Error Handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockReq = {};
  });

  test('handles ApiError with correct status code', () => {
    const err = new ApiError(404, 'BOOKING_NOT_FOUND', 'Not found');
    errorHandler(err, mockReq as Request, mockRes as Response, jest.fn() as NextFunction);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 'BOOKING_NOT_FOUND',
      message: 'Not found',
    });
  });

  test('handles 409 ApiError', () => {
    const err = new ApiError(409, 'SLOT_ALREADY_TAKEN', 'Slot taken');
    errorHandler(err, mockReq as Request, mockRes as Response, jest.fn() as NextFunction);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 'SLOT_ALREADY_TAKEN',
      message: 'Slot taken',
    });
  });

  test('handles unknown errors as 500', () => {
    const err = new Error('Something broke');
    errorHandler(err, mockReq as Request, mockRes as Response, jest.fn() as NextFunction);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  });
});
