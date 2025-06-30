/* eslint-disable perfectionist/sort-imports */
import React, { useState, useEffect } from 'react';

import AccountSettingsView from './AccountSettingsView';
import { updateUserSettings } from './api';

export default function AccountSettingsContainer() {
  const [email, setEmail] = useState('haythem@example.com');
  const [token, setToken] = useState('glpat-xxxxxxxxxxxxxxxxxx');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.id) {
        setUserId(user.id);
      }
    }
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!userId) {
      setError("Impossible de récupérer l'identifiant utilisateur");
      return;
    }

    setLoading(true);
    try {
      await updateUserSettings({ id: userId, email, password: newPassword });
      setSuccess('Informations mises à jour avec succès !');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <AccountSettingsView
      email={email}
      token={token}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      loading={loading}
      success={success}
      error={error}
      onEmailChange={setEmail}
      onTokenChange={setToken}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSave={handleSave}
      onBack={handleBack}
    />
  );
}
