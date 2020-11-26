// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export * as PACKAGE from '../../package.json';

import { tryGet } from '../utils';

export class ConfigService {

  static INSTANCE: ConfigService;

  private static async fetchExternalConfig(): Promise<any> {
    const configFilename = `oyd-sharing.config.json`;

    try {
      const res = await fetch(`./${configFilename}`);
      const json = await res.json();

      return json;
    } catch (e) {
      return {};
    }
  }

  static async initialize(): Promise<ConfigService> {
    if (!ConfigService.INSTANCE) {
      const config = await ConfigService.fetchExternalConfig();
      ConfigService.INSTANCE = new ConfigService(config);
    }

    return ConfigService.getInstance();
  }

  static getInstance(): ConfigService {
    return ConfigService.INSTANCE;
  }

  static get(...path: string[]) {
    return ConfigService.getInstance().get(...path);
  }

  private constructor(public config: any) { }

  private get(...path: string[]) {
    return tryGet(this.config, ...path);
  }
}