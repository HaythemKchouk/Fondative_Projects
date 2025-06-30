/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import { SignInForm } from './SignInForm';
import { SignInHeader } from './SignInHeader';
import { SignInDivider } from './SignInDivider';

export function SignInView() {
  return (
    <>
      <SignInHeader />
      <SignInForm />
      <SignInDivider />
    </>
  );
}

export * from './SignInView';
