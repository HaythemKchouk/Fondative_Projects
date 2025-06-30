/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import {
  Box,
  Table,
  TableBody,
  Checkbox,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { User } from './types';

const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  top: 20,
  width: 1,
};

type HeadCell = { id: keyof User | 'actions'; label: string };

const headCells: HeadCell[] = [
  { id: 'name', label: 'Nom' },
  { id: 'mail', label: 'Email' },
  { id: 'role', label: 'Rôle' },
  { id: 'projets', label: 'Projets' },
  { id: 'actions', label: 'Actions' },
];

type UserTableProps = {
  users: User[];
  order: 'asc' | 'desc';
  orderBy: keyof User;
  selected: number[];
  page: number;
  rowsPerPage: number;
  onSort: (_: any, prop: keyof User) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (id: number) => void;
  onChangePage: (_: unknown, page: number) => void;
  onChangeRowsPerPage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  emptyRows: number;
};

export function UserTable({
  users,
  order,
  orderBy,
  selected,
  page,
  rowsPerPage,
  onSort,
  onSelectAll,
  onSelectOne,
  onChangePage,
  onChangeRowsPerPage,
  onEdit,
  onDelete,
  emptyRows,
}: UserTableProps) {
  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === users.length && users.length > 0}
                  indeterminate={selected.length > 0 && selected.length < users.length}
                  onChange={onSelectAll}
                />
              </TableCell>
              {headCells.map(h => (
                <TableCell key={h.id} sortDirection={orderBy === h.id ? order : false}>
                  {h.id === 'actions' ? (
                    h.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === h.id}
                      direction={orderBy === h.id ? order : 'asc'}
                      onClick={e => onSort(e, h.id as keyof User)}
                    >
                      {h.label}
                      {orderBy === h.id && (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'asc' ? 'tri ascendant' : 'tri descendant'}
                        </Box>
                      )}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              const isSel = selected.includes(row.id);
              return (
                <TableRow key={row.id} hover selected={isSel}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSel} onClick={() => onSelectOne(row.id)} />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.mail}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    {Array.isArray(row.projets)
                      ? row.projets.join(', ')
                      : String(row.projets)}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => onEdit(row)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(row.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={onChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );
}
