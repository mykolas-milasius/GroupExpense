import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { createTransaction } from '../services/TransactionService';
import type { User } from '../services/UserService';

interface Group {
    id: number;
    title: string;
    users: User[];
}

function CreateTransaction() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [transactionTitle, setTransactionTitle] = useState('');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionUserId, setTransactionUserId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5253/api/Groups/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch group');
                }
                const groupData: Group = await response.json();
                setGroup(groupData);
            } catch (err) {
                setError('Error fetching group: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [id]);

    const handleAddTransaction = async () => {
        if (!transactionTitle.trim()) {
            setError('Transaction title is required');
            return;
        }
        const amount = parseFloat(transactionAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount greater than zero');
            return;
        }
        if (!transactionUserId) {
            setError('Please select a user for the transaction');
            return;
        }
        if (!id) {
            setError('Group ID is missing');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await createTransaction({
                title: transactionTitle,
                amount,
                userId: transactionUserId,
                groupId: parseInt(id)
            });
            setSuccess('Transaction created successfully');
            setTimeout(() => {
                navigate(`/groups/${id}`);
            }, 2000);
        } catch (err) {
            setError('Error creating transaction: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/groups/${id}`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create Transaction
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Group: {group.title}
                        </Typography>
                        <TextField
                            label="Transaction Title"
                            value={transactionTitle}
                            onChange={(e) => setTransactionTitle(e.target.value)}
                            fullWidth
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Amount"
                            type="number"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            fullWidth
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>User</InputLabel>
                            <Select
                                value={transactionUserId}
                                onChange={(e) => setTransactionUserId(e.target.value as number)}
                                label="User"
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>Select a user</em>
                                </MenuItem>
                                {group.users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleAddTransaction}
                            disabled={loading || !transactionTitle.trim() || !transactionAmount || !transactionUserId}
                        >
                            {loading ? 'Creating...' : 'Create Transaction'}
                        </Button>
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <Button variant="contained" onClick={handleBack}>
                            Back to Group
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

export default CreateTransaction;