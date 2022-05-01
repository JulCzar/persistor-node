import { NodeStorage, PersistentStorage } from '../src/services';
import { Duration } from '../src/utils';

const ps = PersistentStorage.getOrCreate('test2');

const duration = new Duration({ seconds: 10 });

ps.setItem(
  'test',
  { method: () => 'test', value: 'methods will be lost' },
  { expireIn: duration }
);

const command = {
  execute: (i: number) =>
    console.log(`segundo: ${i + 1}`, JSON.stringify(ps.getItem('test'))),
};

const preciseTest1 = new Duration({ seconds: 9, milliseconds: 750 });
const preciseTest2 = new Duration({ seconds: 9, milliseconds: 800 });
const preciseTest3 = new Duration({ seconds: 9, milliseconds: 850 });
const preciseTest4 = new Duration({ seconds: 9, milliseconds: 950 });
setTimeout(command.execute, preciseTest1.inMilliseconds, 8.75);
setTimeout(command.execute, preciseTest2.inMilliseconds, 8.8);
setTimeout(command.execute, preciseTest3.inMilliseconds, 8.85);
setTimeout(command.execute, preciseTest4.inMilliseconds, 8.95);

for (let i = 0; i < 15; i++) {
  const timer = new Duration({ seconds: i + 1 });

  setTimeout(command.execute, timer.inMilliseconds, i);
}
