import { firstValueFrom } from 'rxjs';
import { EventsService } from './events.service';

describe('EventsService', () => {
  it('emits scooter status updates as message events', async () => {
    const service = new EventsService();
    const nextEvent = firstValueFrom(service.getScooterStatusStream());

    service.emitScooterStatusChange('scooter-1', 'RENTED');

    await expect(nextEvent).resolves.toMatchObject({
      data: {
        scooterId: 'scooter-1',
        status: 'RENTED',
      },
    });
  });

  it('filters scooter status updates by scooter id', async () => {
    const service = new EventsService();
    const nextEvent = firstValueFrom(
      service.getScooterStatusStream('scooter-2'),
    );

    service.emitScooterStatusChange('scooter-1', 'RENTED');
    service.emitScooterStatusChange('scooter-2', 'AVAILABLE');

    await expect(nextEvent).resolves.toMatchObject({
      data: {
        scooterId: 'scooter-2',
        status: 'AVAILABLE',
      },
    });
  });
});
