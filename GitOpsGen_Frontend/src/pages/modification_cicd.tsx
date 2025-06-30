/* eslint-disable perfectionist/sort-imports */
import {CONFIG} from 'src/config-global';
import {Modificationcicd} from 'src/sections/modification_cicd';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`modification_cicd - ${CONFIG.appName}`}</title>
      <Modificationcicd/>
    </>
  );
}
