
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { GuideServices } from './guide.services';

// ─────────────────────────── GET ────────────────────────────

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

// ─────────────────────────── ADMIN CRUD ────────────────────────────

const createChapter = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.createChapter(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Chapter created successfully',
        data: result
    });
});

const updateChapter = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.updateChapter(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chapter updated successfully',
        data: result
    });
});

const deleteChapter = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.deleteChapter(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});

const createSection = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.createSection(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Section created successfully',
        data: result
    });
});

const updateSection = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.updateSection(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Section updated successfully',
        data: result
    });
});

const deleteSection = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.deleteSection(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});

const createInternalRef = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.createInternalRef(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Internal reference created successfully',
        data: result
    });
});

const updateInternalRef = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.updateInternalRef(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Internal reference updated successfully',
        data: result
    });
});

const deleteInternalRef = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.deleteInternalRef(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});

const createExternalRef = catchAsync(async (req: Request, res: Response) => {
    const result = await GuideServices.createExternalRef(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'External reference created successfully',
        data: result
    });
});

const updateExternalRef = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.updateExternalRef(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'External reference updated successfully',
        data: result
    });
});

const deleteExternalRef = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideServices.deleteExternalRef(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});

export const GuideController = {
    getAllChapters,
    getChapterById,
    getSectionById,
    searchGuide,
    createChapter,
    updateChapter,
    deleteChapter,
    createSection,
    updateSection,
    deleteSection,
    createInternalRef,
    updateInternalRef,
    deleteInternalRef,
    createExternalRef,
    updateExternalRef,
    deleteExternalRef
};
