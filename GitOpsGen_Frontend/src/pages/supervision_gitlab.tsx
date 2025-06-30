/* eslint-disable perfectionist/sort-imports */
import React from 'react';
import { CONFIG } from 'src/config-global';
import { PipelineSupervisor } from 'src/sections/supervision_gitlab';

export default function SupervisionGitlabPage() {
  return (
    <>
      <title>{`PipelineSupervisor - ${CONFIG.appName}`}</title>
      <PipelineSupervisor />
    </>
  );
}
