/* eslint-disable perfectionist/sort-imports */
import React, { useState, useEffect } from 'react';
import { Card, TextField } from '@mui/material';

import { User, GitLabGroup } from './types';
import { descendingComparator, getComparator, applyFilter } from './utils';
import { UserForm } from './UserForm';
import { UserTable } from './UserT';

export function UserView() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof User>('name');
  const [filterName, setFilterName] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [groupOptions, setGroupOptions] = useState<GitLabGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: '', 
    projets: [] as string[] 
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Construit toujours un Record<string,string> valide pour fetch headers
  const buildHeaders = (includeJson = true): Record<string,string> => {
    const h: Record<string,string> = {};
    if (includeJson) h['Content-Type'] = 'application/json';
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        headers: buildHeaders()
      });
      if (res.status === 401) throw new Error('Non autorisé');
      const data = await res.json();
      const normalized: User[] = Array.isArray(data)
        ? data.map((u: any) => ({
            ...u,
            mail: u.mail,
            projets: Array.isArray(u.projets)
              ? u.projets
              : String(u.projets).split(',').map(p => p.trim()),
          }))
        : [];
      setUsers(normalized);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingGroups(true);
      try {
        const res = await fetch('https://gitlab.com/api/v4/groups', {
          headers: {
            Authorization: `Bearer glpat-SDBni-qYtBM1xP_6czHo`
          }
        });
        if (!res.ok) throw new Error('Erreur chargement groupes');
        const allGroups = await res.json();
        const parentGroups = allGroups.filter((g: any) => g.parent_id === null);
        setGroupOptions(parentGroups);
      } catch {
        setGroupOptions([]);
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProjectsChange = (_: any, values: GitLabGroup[]) =>
    setFormData(prev => ({ ...prev, projets: values.map(g => g.name) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingId
        ? `http://localhost:3000/api/users/${editingId}`
        : 'http://localhost:3000/api/users';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: buildHeaders(),
        body: JSON.stringify({
          ...formData,
          id: editingId,
          projets: formData.projets
        }),
      });
      if (response.status === 401) throw new Error('Non autorisé');
      if (!response.ok) throw new Error(await response.text());

      setSuccessMsg(editingId ? 'Utilisateur mis à jour !' : 'Utilisateur créé !');
      resetForm();
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', role: '', projets: [] });
    setEditingId(null);
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.mail,
      password: '',
      name: user.name,
      role: user.role,
      projets: Array.isArray(user.projets)
        ? user.projets
        : String(user.projets).split(',').map(p => p.trim())
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(false),
      });
      if (response.status === 401) throw new Error('Non autorisé');
      if (!response.ok) throw new Error(await response.text());

      setSuccessMsg('Utilisateur supprimé !');
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleSort = (_: any, prop: keyof User) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? users.map(u => u.id) : []);
  
  const handleClick = (id: number) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  
  const handleChangePage = (_: unknown, p: number) => setPage(p);
  
  const handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };
  
  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
    setPage(0);
  };

  const dataFiltered = applyFilter(users, getComparator(order, orderBy), filterName, 'name');
  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - dataFiltered.length);

  return (
    <Card sx={{ p: 2 }}>
      <UserForm
        formData={formData}
        groupOptions={groupOptions}
        loadingGroups={loadingGroups}
        loading={loading}
        editingId={editingId}
        errorMsg={errorMsg}
        successMsg={successMsg}
        onInputChange={handleInputChange}
        onProjectsChange={handleProjectsChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <TextField 
        placeholder="Rechercher par nom…" 
        value={filterName} 
        onChange={handleFilter} 
        fullWidth 
        sx={{ maxWidth: 300, mb: 2 }} 
        autoComplete="off"
      />

      <UserTable
        users={dataFiltered}
        order={order}
        orderBy={orderBy}
        selected={selected}
        page={page}
        rowsPerPage={rowsPerPage}
        onSort={handleSort}
        onSelectAll={handleSelectAll}
        onSelectOne={handleClick}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyRows={emptyRows}
      />
    </Card>
  );
}
