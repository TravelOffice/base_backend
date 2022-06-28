/* eslint-disable no-console */
const logger = {
  log(message: any) {
    const caller = new Error().stack?.split('\n')[2].replace('at', '').trim();
    console.log(`[${caller}]: ${message}`);
  },
};

export default logger;
