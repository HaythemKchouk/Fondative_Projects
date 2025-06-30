interface UpdateUserSettingsPayload {
  id: number;
  email: string;
  password: string;
}

export async function updateUserSettings(payload: UpdateUserSettingsPayload) {
  const response = await fetch('http://localhost:3000/api/parametre/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la mise à jour.');
  }

  return data;
}
