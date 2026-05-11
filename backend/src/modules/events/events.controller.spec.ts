import { of } from 'rxjs';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  it('delegates scooter status streams to EventsService', () => {
    const stream = of({ data: { scooterId: 'scooter-1', status: 'RENTED' } });
    const getScooterStatusStream = jest.fn().mockReturnValue(stream);
    const service = {
      getScooterStatusStream,
    } as unknown as EventsService;
    const controller = new EventsController(service);

    expect(controller.scooterStatus('scooter-1')).toBe(stream);
    expect(getScooterStatusStream).toHaveBeenCalledWith('scooter-1');
  });
});
