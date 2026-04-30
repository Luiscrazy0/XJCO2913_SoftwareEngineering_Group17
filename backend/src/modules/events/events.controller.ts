import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('scooter-status')
  scooterStatus(
    @Query('scooterId') scooterId?: string,
  ): Observable<MessageEvent> {
    return this.eventsService.getScooterStatusStream(scooterId);
  }
}
