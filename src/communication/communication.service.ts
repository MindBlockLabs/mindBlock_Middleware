import { Injectable } from "@nestjs/common"
import { type ClientProxy, EventPattern, MessagePattern } from "@nestjs/microservices"
import type { MessageDto } from "./dtos/message.dto"
import { lastValueFrom } from "rxjs"

@Injectable()
export class CommunicationService {
  private readonly client: ClientProxy

  constructor(client: ClientProxy) {
    this.client = client
  }

  /**
   * Sends an event message to other services.
   * Events are fire-and-forget.
   */
  async emitEvent(eventType: string, payload: any, sourceService: string) {
    const message: MessageDto = {
      id: Math.random().toString(36).substring(2, 15),
      payload,
      timestamp: Date.now(),
      sourceService,
      eventType,
    }
    console.log(`Emitting event '${eventType}' from ${sourceService}:`, message)
    this.client.emit(eventType, message)
  }

  /**
   * Sends a request message to another service and waits for a response.
   * Requests are typically used for RPC (Remote Procedure Call) patterns.
   */
  async sendRequest(requestType: string, payload: any, sourceService: string, targetService?: string): Promise<any> {
    const message: MessageDto = {
      id: Math.random().toString(36).substring(2, 15),
      payload,
      timestamp: Date.now(),
      sourceService,
      targetService,
      requestType,
    }
    console.log(`Sending request '${requestType}' from ${sourceService} to ${targetService || "any"}:`, message)
    // Use lastValueFrom to convert Observable to Promise for async/await
    return lastValueFrom(this.client.send(requestType, message))
  }

  /**
   * Example handler for an incoming event.
   * This method acts as a microservice event listener.
   */
  @EventPattern("user_created")
  handleUserCreatedEvent(data: MessageDto) {
    console.log(`CommunicationService received 'user_created' event:`, data)
    // Here you can add logic to process the event, e.g., send a welcome email
  }

  /**
   * Example handler for an incoming request.
   * This method acts as a microservice message listener (RPC).
   */
  @MessagePattern("get_user_details")
  handleGetUserDetailsRequest(data: MessageDto): { userId: string; name: string; status: string } {
    console.log(`CommunicationService received 'get_user_details' request:`, data)
    // Simulate fetching user details
    const userId = data.payload.userId
    return { userId, name: `User ${userId}`, status: "active" }
  }

  /**
   * Another example request handler.
   */
  @MessagePattern("process_order")
  handleProcessOrderRequest(data: MessageDto): { orderId: string; status: string } {
    console.log(`CommunicationService received 'process_order' request:`, data)
    // Simulate order processing
    const orderId = data.payload.orderId
    return { orderId, status: "processed" }
  }
}
