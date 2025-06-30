/* eslint-disable perfectionist/sort-imports */
import {CONFIG} from 'src/config-global';
import {FormulaireValues} from 'src/sections/formulaire_values';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`FormulaireValues - ${CONFIG.appName}`}</title>
      <FormulaireValues />
    </>
  );
}
