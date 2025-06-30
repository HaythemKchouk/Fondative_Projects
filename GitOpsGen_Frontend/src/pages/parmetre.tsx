/* eslint-disable perfectionist/sort-imports */
import {CONFIG} from 'src/config-global';
import {AccountSettings} from 'src/sections/parametre';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`AccountSettings - ${CONFIG.appName}`}</title>
      <AccountSettings/>
    </>
  );
}
