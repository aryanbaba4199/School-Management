import { Request, Response, NextFunction } from 'express';
import { MasterService } from './master.service';
import { sendSuccess, sendError } from '../../common/utils/response.handler';

/*------------- Master Controller Definition -------------*/

const masterService = new MasterService();

export class MasterController {
  /**
   * HTTP POST /api/masters/states
   */
  async createState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = await masterService.createState(req.body);
      sendSuccess(res, 201, state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create State';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/masters/states
   */
  async getStates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const states = await masterService.findAllStates();
      sendSuccess(res, 200, states);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch States';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP POST /api/masters/districts
   */
  async createDistrict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const district = await masterService.createDistrict(req.body);
      sendSuccess(res, 201, district);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create District';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/masters/districts
   */
  async getDistricts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stateId = req.query.stateId as string | undefined;
      const districts = await masterService.findDistricts(stateId);
      sendSuccess(res, 200, districts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Districts';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP POST /api/masters/cities
   */
  async createCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = await masterService.createCity(req.body);
      sendSuccess(res, 201, city);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create City';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/masters/cities
   */
  async getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const districtId = req.query.districtId as string | undefined;
      const cities = await masterService.findCities(districtId);
      sendSuccess(res, 200, cities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Cities';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP POST /api/masters/subscription-plans
   */
  async createSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await masterService.createSubscriptionPlan(req.body);
      sendSuccess(res, 201, plan);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create Subscription Plan';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP GET /api/masters/subscription-plans
   */
  async getSubscriptionPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await masterService.findAllSubscriptionPlans();
      sendSuccess(res, 200, plans);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Subscription Plans';
      sendError(res, 500, errorMessage);
    }
  }

  /**
   * HTTP PUT /api/masters/subscription-plans/:id
   */
  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const plan = await masterService.updateSubscriptionPlan(id, req.body);
      sendSuccess(res, 200, plan);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Subscription Plan';
      sendError(res, 400, errorMessage);
    }
  }

  /**
   * HTTP DELETE /api/masters/subscription-plans/:id
   */
  async deleteSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await masterService.deleteSubscriptionPlan(id);
      sendSuccess(res, 200, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Subscription Plan';
      sendError(res, 400, errorMessage);
    }
  }
}
