
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { GuideServices } from './guide.services';

const getAllChapters = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.getAllChapters();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chapters retrieved successfully',
        data: result
    });
});

const getChapterById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.getChapterById(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chapter retrieved successfully',
        data: result
    });
});

const getSectionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.getSectionById(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Section retrieved successfully',
        data: result
    });
});

const searchGuide = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.searchGuide(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Search results retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

export const GuideController = {
    getAllChapters,
    getChapterById,
    getSectionById,
    searchGuide
};
