import path from 'path';
import type { Plugin } from '@docusaurus/types';

export default function themeArtemisaursPlugin(): Plugin<void> {
  return {
    name: '@geastack-community/artemisaurs',

    getClientModules() {
      return [path.resolve(__dirname, './theme/css/custom.css')];
    },

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },
  };
}
