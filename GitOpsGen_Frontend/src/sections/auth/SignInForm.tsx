/* eslint-disable perfectionist/sort-imports */
import React, { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

export function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      return () => {};
    }

    window.history.pushState(null, document.title, window.location.href);

    const onPopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [loggedIn]);

  const handleSignIn = useCallback(async () => {
    try {
      console.log('Tentative de connexion avec :', { email, password });

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('Réponse du serveur:', text);

      if (!response.ok) {
        throw new Error(`Erreur lors de la connexion: ${response.status} - ${text}`);
      }

      const data = JSON.parse(text);
      console.log('Connexion réussie', data);

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setLoggedIn(true);
      router.replace('/user');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }, [email, password, router]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
      <TextField
        fullWidth
        name="email"
        label="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Mot de passe oublié ?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button fullWidth size="large" color="inherit" variant="contained" onClick={handleSignIn}>
        Se connecter
      </Button>
    </Box>
  );
}
