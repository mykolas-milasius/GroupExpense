import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import { fetchUsers } from '../services/UserService';
import type { User } from '../services/UserService';

interface Group {
    id: number;
    title: string;
    users: User[];
}

function GroupDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const groupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
                if (!groupResponse.ok) {
                    throw new Error('Failed to fetch group');
                }
                const groupData: Group = await groupResponse.json();
                setGroup(groupData);

                const usersData = await fetchUsers();
                setUsers(usersData);
            } catch (err) {
                setError('Error fetching data: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddUser = async () => {
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:5253/api/Groups/${id}/users/${selectedUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to add user to group');
            }
            const updatedGroupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
            const updatedGroup: Group = await updatedGroupResponse.json();
            setGroup(updatedGroup);
            setSelectedUserId('');
            setSuccess('User added successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error adding user: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/groups');
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Group Details
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : group ? (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            ID: {group.id}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Title: {group.title}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Members:
                        </Typography>
                        <List>
                            {group.users.length > 0 ? (
                                group.users.map((user) => (
                                    <ListItem key={user.id}>
                                        <ListItemText primary={user.name} />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="No members" />
                                </ListItem>
                            )}
                        </List>
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Add User</InputLabel>
                                <Select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value as number)}
                                    label="Add User"
                                >
                                    <MenuItem value="">
                                        <em>Select a user</em>
                                    </MenuItem>
                                    {users
                                        .filter((user) => !group.users.some((u) => u.id === user.id))
                                        .map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                onClick={handleAddUser}
                                disabled={loading || !selectedUserId}
                                sx={{ mb: 2 }}
                            >
                                {loading ? 'Adding...' : 'Add User'}
                            </Button>
                        </Box>
                        {success && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <Button variant="contained" onClick={handleBack}>
                            Back to Groups
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Group not found
                    </Alert>
                )}
            </Box>
        </Container>
    );
}

export default GroupDetails;