import { Injectable } from '@nestjs/common';
import { Subject, filter, map } from 'rxjs';

export interface ScooterStatusEvent {
  scooterId: string;
  status: string;
  timestamp: string;
}

@Injectable()
export class EventsService {
  private scooterEvents = new Subject<ScooterStatusEvent>();

  emitScooterStatusChange(scooterId: string, status: string) {
    const event: ScooterStatusEvent = {
      scooterId,
      status,
      timestamp: new Date().toISOString(),
    };
    this.scooterEvents.next(event);
  }

  getScooterStatusStream(scopterId?: string) {
    return this.scooterEvents.asObservable().pipe(
      filter((event) => !scopterId || event.scooterId === scopterId),
      map((event) => ({ data: event })),
    );
  }
}
