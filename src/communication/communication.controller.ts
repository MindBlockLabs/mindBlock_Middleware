
import { Controller, Post, Get, Param, UseInterceptors } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import type { CommunicationService } from "./communication.service"
import { LoggingInterceptor } from "./interceptors/logging.interceptor"

@ApiTags('Communication')
@UseInterceptors(LoggingInterceptor) // Apply the logging interceptor to this controller
@Controller("communication")
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post("emit-event")
  @ApiOperation({ summary: 'Emit an event' })
  @ApiBody({ schema: { type: 'object', properties: { eventType: { type: 'string' }, payload: { type: 'object' }, sourceService: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Event emitted successfully.' })
  async emitEvent(message: { eventType: string; payload: any; sourceService: string }) {
    await this.communicationService.emitEvent(message.eventType, message.payload, message.sourceService)
    return { status: "Event emitted successfully" }
  }

  @Post("send-request")
  @ApiOperation({ summary: 'Send a request' })
  @ApiBody({ schema: { type: 'object', properties: { requestType: { type: 'string' }, payload: { type: 'object' }, sourceService: { type: 'string' }, targetService: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Request sent, response received.' })
  async sendRequest(message: { requestType: string; payload: any; sourceService: string; targetService?: string }) {
    const response = await this.communicationService.sendRequest(
      message.requestType,
      message.payload,
      message.sourceService,
      message.targetService,
    )
    return { status: "Request sent, response received", data: response }
  }

  // Example HTTP endpoint that might be called by a frontend or another backend service
  // This endpoint then forwards the request internally via the microservice pattern
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user details from frontend' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Details for user.' })
  async getUserDetailsFromFrontend(@Param('userId') userId: string) {
    console.log(`HTTP endpoint received request for user: ${userId}`);
    const response = await this.communicationService.sendRequest(
      'get_user_details',
      { userId },
      'frontend-gateway', // Source service
      'user-service', // Target service (conceptual)
    );
    return { message: `Details for user ${userId}`, data: response };
  }

  @Post("order/process")
  async processOrderFromBackend(orderData: any) {
    console.log(`HTTP endpoint received request to process order:`, orderData)
    const response = await this.communicationService.sendRequest(
      "process_order",
      orderData,
      "backend-api", // Source service
      "order-processing-service", // Target service (conceptual)
    )
    return { message: "Order processing initiated", data: response }
  }
}
