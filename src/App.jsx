import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

const API_BASE = 'https://block-tracking.onrender.com';

export default function BlockTrackingDashboard() {
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [blocksCut, setBlocksCut] = useState('');
  const [date, setDate] = useState('');

  const fetchStaff = async () => {
    const res = await fetch(`${API_BASE}/staff`);
    const data = await res.json();
    setStaff(data);
  };

  const fetchEntries = async (staffId = '') => {
    const url = staffId ? `${API_BASE}/entries?staff_id=${staffId}` : `${API_BASE}/entries`;
    const res = await fetch(url);
    const data = await res.json();
    setEntries(data);
  };

  useEffect(() => {
    fetchStaff();
    fetchEntries();
  }, []);

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) return;
    await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newStaffName })
    });
    setNewStaffName('');
    fetchStaff();
  };

  const handleDeleteStaff = async (id) => {
    await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
    fetchStaff();
    fetchEntries();
  };

  const handleAddEntry = async () => {
    if (!selectedStaffId || !blocksCut || !date) return;
    await fetch(`${API_BASE}/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_id: selectedStaffId,
        date,
        blocks_cut: parseInt(blocksCut)
      })
    });
    setBlocksCut('');
    setDate('');
    fetchEntries();
  };

  const handleDeleteEntry = async (id) => {
    await fetch(`${API_BASE}/entry/${id}`, { method: 'DELETE' });
    fetchEntries();
  };

  const handleReset = async () => {
    await fetch(`${API_BASE}/reset`, { method: 'POST' });
    fetchStaff();
    fetchEntries();
  };

  const handleExport = () => {
    window.open(`${API_BASE}/export`, '_blank');
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Histology Block Tracking</h1>

      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold text-xl">Add Staff</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Staff name"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
            />
            <Button onClick={handleAddStaff}>Add</Button>
          </div>

          <div className="mt-2">
            <h3 className="font-medium">Staff List</h3>
            <ul className="list-disc pl-5">
              {staff.map((s) => (
                <li key={s.id} className="flex justify-between items-center">
                  {s.name}
                  <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(s.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold text-xl">Add Entry</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              className="border p-2 rounded"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            >
              <option value="">Select Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Blocks Cut"
              value={blocksCut}
              onChange={(e) => setBlocksCut(e.target.value)}
            />
            <Button onClick={handleAddEntry}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold text-xl">Entries</h2>
          <div className="flex justify-between items-center mb-2">
            <select
              className="border p-2 rounded"
              onChange={(e) => fetchEntries(e.target.value)}
            >
              <option value="">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="space-x-2">
              <Button onClick={handleExport}>Export</Button>
              <Button variant="destructive" onClick={handleReset}>Reset All</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Blocks Cut</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.staff}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.blocks_cut}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}