import React, { useEffect, useState } from 'react';
import {
  Card, CardHeader, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Box,
  Stack, TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const toLocalDate = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
const getToday = () => toLocalDate(new Date());

export default function ConsignmentList({ apiUrl, refresh, token }) {
  const [consignments, setConsignments] = useState([]);
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [loading, setLoading] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchConsignments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/consignments`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch consignments');
      const data = await res.json();
      setConsignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching consignments:', err);
      alert('Unable to load consignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsignments(); }, [refresh, apiUrl]);

  const deleteConsignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this consignment?')) return;

    try {
      const res = await fetch(`${apiUrl}/consignments/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Backend error');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      
      alert('✅ Consignment deleted successfully');
      setSelectedConsignment(null);
      fetchConsignments();
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const filtered = consignments.filter((c) => {
    const cDate = c.date ? toLocalDate(c.date) : '';
    return (!startDate || cDate >= startDate) && (!endDate || cDate <= endDate);
  });

  return (
    <Card>
      <CardHeader title="Consignment List" subheader={`Showing ${filtered.length} record${filtered.length === 1 ? '' : 's'}`} />
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: { xs: '100%', sm: 180 } }} />
          <TextField label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: { xs: '100%', sm: 180 } }} />
        </Stack>
        {loading ? (<Typography>Loading…</Typography>) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: '#ff8a00' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Document No.</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>QTY</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Package Type</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No consignments found.</TableCell></TableRow>
                  ) : filtered.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.date || '-'}</TableCell>
                      <TableCell>{c.document_number || '-'}</TableCell>
                      <TableCell>{c.qty || '-'}</TableCell>
                      <TableCell>{c.package_type || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          title="View Details"
                          onClick={() => setSelectedConsignment(c)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete"
                          onClick={() => deleteConsignment(c.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Detail View */}
            {selectedConsignment && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <h3>📋 Consignment Details</h3>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box><strong>Date:</strong> {selectedConsignment.date || '-'}</Box>
                  <Box><strong>GP Number:</strong> {selectedConsignment.gp_number || '-'}</Box>
                  <Box><strong>Type:</strong> {selectedConsignment.type || '-'}</Box>
                  <Box><strong>Document Number:</strong> {selectedConsignment.document_number || '-'}</Box>
                  <Box><strong>Document Type:</strong> {selectedConsignment.document_type || '-'}</Box>
                  <Box><strong>In-Time:</strong> {selectedConsignment.in_time || '-'}</Box>
                  <Box><strong>Vehicle Number:</strong> {selectedConsignment.vehicle_number || '-'}</Box>
                  <Box><strong>Driver Contact:</strong> {selectedConsignment.driver_contact || '-'}</Box>
                  <Box><strong>QTY:</strong> {selectedConsignment.qty || '-'}</Box>
                  <Box><strong>Package Type:</strong> {selectedConsignment.package_type || '-'}</Box>
                  <Box><strong>Comment:</strong> {selectedConsignment.comment || '-'}</Box>
                  <Box><strong>Security Name:</strong> {selectedConsignment.security_name || '-'}</Box>
                </Box>
                {selectedConsignment.photo && (
                  <Box sx={{ mt: 2 }}>
                    <strong>Photo:</strong>
                    <img
                      src={selectedConsignment.photo}
                      alt="Consignment"
                      style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }}
                    />
                  </Box>
                )}
                <button
                  onClick={() => setSelectedConsignment(null)}
                  style={{
                    marginTop: '15px',
                    padding: '8px 16px',
                    backgroundColor: '#ff8a00',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Close Details
                </button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}