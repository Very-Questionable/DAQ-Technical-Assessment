import { TemperatureTimestamp, checkIncident } from './src/checkIncident';
import fs from 'fs';
// removes incidents.log
const INCIDENT_PATH = 'incidents.log';
beforeAll(() => {
  if (fs.existsSync(INCIDENT_PATH)) fs.unlinkSync(INCIDENT_PATH);
});

test('incident', () => {
  const temp: TemperatureTimestamp[] = [{
    battery_temperature: 0,
    timestamp: Date.now()
  }, {
    battery_temperature: 0,
    timestamp: Date.now() + 1000
  }, {
    battery_temperature: 0,
    timestamp: Date.now() + 2000
  }];
  for (const i of temp) {
    checkIncident(i);
  }
  const result = fs.readFileSync(INCIDENT_PATH, { encoding: 'utf8', flag: 'r' });
  expect(parseInt(result)).toEqual(temp[2].timestamp);
  fs.unlinkSync(INCIDENT_PATH);
});
test('no incident', () => {
  const temp: TemperatureTimestamp[] = [{
    battery_temperature: 30,
    timestamp: Date.now()
  }, {
    battery_temperature: 30,
    timestamp: Date.now() + 1000
  }, {
    battery_temperature: 30,
    timestamp: Date.now() + 2000
  }];
  for (const i of temp) {
    checkIncident(i);
  }
  expect(fs.existsSync(INCIDENT_PATH)).toBeFalsy();
});
