import { CONFIG } from 'src/config-global';

import { Dashboard } from 'src/sections/dashboard';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>


      <Dashboard />
    </>
  );
}
