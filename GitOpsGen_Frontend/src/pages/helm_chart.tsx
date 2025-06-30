/* eslint-disable perfectionist/sort-imports */
import {CONFIG} from 'src/config-global';
import {HelmChartUploader} from 'src/sections/helm_chart';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`helm_Chart - ${CONFIG.appName}`}</title>
      <HelmChartUploader />
    </>
  );
}
