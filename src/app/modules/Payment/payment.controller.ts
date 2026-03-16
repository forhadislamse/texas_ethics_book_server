import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentServices } from './payment.services';
import ApiError from '../../../errors/ApiErrors';

const createSubscriptionIntent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { planId } = req.body;

    if (!planId) {
        throw new ApiError(400, 'planId is required');
    }

    const result = await PaymentServices.createSubscriptionIntent(userId, planId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscription intent created successfully',
        data: result
    });
});

const handleWebhook = catchAsync(async (req: Request & { rawBody?: Buffer }, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const result = await PaymentServices.handleWebhook(req.rawBody as any, sig);
    res.status(200).send(result);
});

export const PaymentController = {
    createSubscriptionIntent,
    handleWebhook,
};
