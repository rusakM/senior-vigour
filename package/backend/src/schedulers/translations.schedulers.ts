import cron from 'node-cron';
import spawn from 'cross-spawn';

import { ConstantsEnv } from '../core/constants';
import * as defs from '../shared/defs';

export default function setupSchedulers() {
    if (!defs.Helper.isTestModeEnabled()) {
        cron.schedule('*/30 * * * *', () => {
            spawn.sync('bash', ['src/scripts/refreshTranslations.sh', '--authkey', ConstantsEnv.Tolgee.TOLGEE_API_KEY, '--location', ConstantsEnv.Tolgee.TOLGEE_CATALOG], { stdio: 'inherit' });
        });
    }
}
