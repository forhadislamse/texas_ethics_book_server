import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminService } from './admin.service';

const getAllPaidTransactions = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await AdminService.getAllPaidTransactions(query as any);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Paid transactions fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await AdminService.getAllUsersWithPayments(query as any);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getDashboardStats();
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dashboard statistics fetched successfully',
        data: result
    });
});

export const AdminController = {
    getAllPaidTransactions,
    getAllUsers,
    getDashboardStats
};
