/* eslint-disable perfectionist/sort-imports */
import { CONFIG } from 'src/config-global';
import { ConfigurationGroupsView } from 'src/sections/configuration_groups';

export default function Page() {
  return (
    <>
      <title>{`Configuration_groups - ${CONFIG.appName}`}</title>
      <ConfigurationGroupsView />
    </>
  );
}
