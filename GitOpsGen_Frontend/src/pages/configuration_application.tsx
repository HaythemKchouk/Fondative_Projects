import { CONFIG } from 'src/config-global';

import {ConfigurationApplicationView} from 'src/sections/configuration_application';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Configuration_du_application - ${CONFIG.appName}`}</title>

      <ConfigurationApplicationView />
    </>
  );
}


