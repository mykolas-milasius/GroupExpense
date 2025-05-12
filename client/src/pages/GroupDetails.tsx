import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import { fetchUsers } from '../services/UserService';
import { fetchTransactionsByGroup} from '../services/TransactionService';
import type { User } from '../services/UserService';
import type { Transaction } from '../services/TransactionService';

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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
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

                const transactionsData = await fetchTransactionsByGroup(parseInt(id!));
                setTransactions(transactionsData);
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

    const handleRemoveUser = async (userId: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:5253/api/Groups/${id}/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to remove user from group');
            }
            const updatedGroupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
            const updatedGroup: Group = await updatedGroupResponse.json();
            setGroup(updatedGroup);
            setSuccess('User removed successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error removing user: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleNewTransaction = () => {
        navigate(`/groups/${id}/transactions/new`);
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
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
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
                                    <ListItem key={user.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <ListItemText primary={user.name} />
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleRemoveUser(user.id)}
                                            disabled={loading}
                                        >
                                            Remove
                                        </Button>
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="No members" />
                                </ListItem>
                            )}
                        </List>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Transactions:
                        </Typography>
                        <List>
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <ListItem key={transaction.id}>
                                        <ListItemText
                                            primary={`${transaction.title}: ${transaction.amount.toFixed(2)} by ${transaction.user?.name || 'Unknown'}`}
                                            secondary={new Date(transaction.date).toLocaleDateString()}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="No transactions" />
                                </ListItem>
                            )}
                        </List>
                        <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Add User to Group
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Add User</InputLabel>
                                <Select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value as number)}
                                    label="Add User"
                                    disabled={loading}
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
                            >
                                {loading ? 'Adding...' : 'Add User'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNewTransaction}
                                disabled={loading}
                            >
                                New Transaction
                            </Button>
                        </Box>
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
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