import { _posts } from 'src/_mock';
import { CONFIG } from 'src/config-global';

import { Chatbot } from 'src/sections/ChatBot';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Chatbot - ${CONFIG.appName}`}</title>

      <Chatbot />
    </>
  );
}
