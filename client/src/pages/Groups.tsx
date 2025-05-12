import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Alert } from '@mui/material';

interface Group {
    id: number;
    title: string;
}

function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5253/api/Groups');
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data: Group[] = await response.json();
                setGroups(data);
            } catch (err) {
                setError('Error fetching groups: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroupTitle.trim()) {
            setError('Group title is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5253/api/Groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newGroupTitle, description: '' })
            });
            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            const createdGroup: Group = await response.json();
            setGroups([...groups, createdGroup]);
            setNewGroupTitle('');
        } catch (err) {
            setError('Error creating group: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewGroupTitle(e.target.value);
    };

    const handleViewDetails = (id: number) => {
        navigate(`/groups/${id}`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Groups
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Welcome to the group page! This is where you can create a new group, see a list of groups and how much you owe or are owed.
                </Typography>
                <Box sx={{ mb: 4 }}>
                    <TextField
                        label="Group Title"
                        name="title"
                        value={newGroupTitle}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        error={!!error && !newGroupTitle.trim()}
                    />
                    <Button
                        variant="contained"
                        onClick={handleCreateGroup}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create a new group'}
                    </Button>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : groups.length > 0 ? (
                                groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.id}</TableCell>
                                        <TableCell>{group.title}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleViewDetails(group.id)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No groups found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}

export default Groups;