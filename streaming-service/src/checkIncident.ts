import fs from 'fs';

export interface TemperatureTimestamp {
    battery_temperature: number;
    timestamp: number;
}

let incident: TemperatureTimestamp[] = [];
/**
 * Updates the current status of potential incidents which are stored in a queue
 * @param src current temperature and timestamp
 * @returns void
 */
export function checkIncident(src: TemperatureTimestamp) {
  if (src.battery_temperature > 20 && src.battery_temperature < 80) {
    return;
  }

  incident.push(src);

  // ensures that no 2 timestamps differ by 5 seconds
  if (src.timestamp - incident[0].timestamp > 5000) {
    incident.shift();
    return;
  }

  // resets the incident queue if an 3 or more incidents have occured
  if (incident.length === 3) {
    // this should probablly be asyncronous
    fs.writeFileSync('incidents.log', src.timestamp.toString() + '\n', { flag: 'a+' });
    incident = [];
  }
}
