import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { CommunicationService } from "./communication.service"
import { CommunicationController } from "./communication.controller"

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "COMMUNICATION_SERVICE",
        transport: Transport.REDIS,
        options: {
          host: "localhost", // Replace with your Redis host
          port: 6379, // Replace with your Redis port
        },
      },
    ]),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService], // Export the service so other modules can use it
})
export class CommunicationModule {}
