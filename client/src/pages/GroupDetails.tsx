import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    FormControl,
    FormLabel,
} from '@mui/material';
import { fetchTransactionsByGroup } from '../services/TransactionService';
import type { Transaction } from '../services/TransactionService';

interface Group {
    id: number;
    title: string;
    balance: number;
    users: { id: number; name: string }[];
}

function GroupDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openSettleModal, setOpenSettleModal] = useState(false);
    const [settleType, setSettleType] = useState<'Equally' | 'Percentage' | 'Dynamic'>('Equally');
    const [percentages, setPercentages] = useState<{ [key: number]: number }>({});
    const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
    const fixedUserId = 1; // Hard-coded user ID (Michael)

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
        if (!group) return;

        if (group.users.some((u) => u.id === fixedUserId)) {
            setError('You are already a member of this group');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:5253/api/Groups/${id}/users/${fixedUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to add user to group');
            }
            const updatedGroupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
            const updatedGroup: Group = await updatedGroupResponse.json();
            setGroup(updatedGroup);
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
                method: 'DELETE',
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

    const handleOpenSettleModal = () => {
        setOpenSettleModal(true);
        setPercentages({});
        setAmounts({});
    };

    const handleCloseSettleModal = () => {
        setOpenSettleModal(false);
        setSettleType('Equally');
        setPercentages({});
        setAmounts({});
    };

    const handleSettleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSettleType(event.target.value as 'Equally' | 'Percentage' | 'Dynamic');
        setPercentages({});
        setAmounts({});
    };

    const handlePercentageChange = (userId: number, value: string) => {
        const percentage = parseFloat(value) || 0;
        setPercentages((prev) => ({ ...prev, [userId]: percentage }));
    };

    const handleAmountChange = (userId: number, value: string) => {
        const amount = parseFloat(value) || 0;
        setAmounts((prev) => ({ ...prev, [userId]: amount }));
    };

    const handleSettleDebt = () => {
        if (!group) return;

        // Validacija
        if (settleType === 'Percentage') {
            const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
            if (totalPercentage !== 100) {
                setError('Percentages must sum to 100%');
                return;
            }
        } else if (settleType === 'Dynamic') {
            const totalAmount = Object.values(amounts).reduce((sum, a) => sum + a, 0);
            if (totalAmount !== Math.abs(group.balance)) {
                setError(`Total amount must equal €${Math.abs(group.balance).toFixed(2)}`);
                return;
            }
        }

        // Čia būtų backend'o užklausa, bet dabar tik uždarome modalą
        setSuccess('Debt settlement submitted (frontend only)');
        setTimeout(() => setSuccess(null), 3000);
        handleCloseSettleModal();
    };

    // Rūšiuojame vartotojus, kad fixedUserId (1) būtų pirmas
    const sortedUsers = group
        ? [...group.users].sort((a, b) => (a.id === fixedUserId ? -1 : b.id === fixedUserId ? 1 : 0))
        : [];

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
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Title: {group.title}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Balance:
                            {group.balance > 0 ? (
                                <Typography component="span" color="green">
                                    {' '}
                                    Owed to you: €{group.balance.toFixed(2)}
                                </Typography>
                            ) : group.balance < 0 ? (
                                <Typography component="span" color="red">
                                    {' '}
                                    You owe: €{Math.abs(group.balance).toFixed(2)}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenSettleModal}
                                        disabled={loading}
                                        sx={{ ml: 2 }}
                                    >
                                        Settle Debt
                                    </Button>
                                </Typography>
                            ) : (
                                <Typography component="span">{' '}Balance: €0.00</Typography>
                            )}
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
                                            disabled={loading || user.id === fixedUserId}
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
                                            primary={`${transaction.title}: €${transaction.amount.toFixed(2)} by ${transaction.user?.name || 'Unknown'}`}
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
                            <Button
                                variant="contained"
                                onClick={handleAddUser}
                                disabled={loading || (group && group.users.some((u) => u.id === fixedUserId))}
                            >
                                {loading ? 'Adding...' : 'Add Yourself to Group'}
                            </Button>
                            <Button variant="contained" onClick={handleNewTransaction} disabled={loading}>
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

            {/* Settle Debt Modal */}
            <Dialog
                open={openSettleModal}
                onClose={handleCloseSettleModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Settle Debt</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Settle Type</FormLabel>
                        <RadioGroup value={settleType} onChange={handleSettleTypeChange}>
                            <FormControlLabel value="Equally" control={<Radio />} label="Equally" />
                            <FormControlLabel value="Percentage" control={<Radio />} label="Percentage" />
                            <FormControlLabel value="Dynamic" control={<Radio />} label="Dynamic" />
                        </RadioGroup>
                    </FormControl>

                    {settleType === 'Equally' && group && (
                        <Typography>
                            Each member will pay: €{(Math.abs(group.balance) / group.users.length).toFixed(2)}
                        </Typography>
                    )}

                    {settleType === 'Percentage' && group && (
                        <Box>
                            {sortedUsers.map((user) => (
                                <Box key={user.id} sx={{ mb: 2 }}>
                                    <TextField
                                        label={user.id === fixedUserId ? 'My Percentage' : `${user.name}'s Percentage`}
                                        type="number"
                                        value={percentages[user.id] || ''}
                                        onChange={(e) => handlePercentageChange(user.id, e.target.value)}
                                        fullWidth
                                        inputProps={{ min: 0, max: 100 }}
                                    />
                                </Box>
                            ))}
                            <Typography>
                                Total Percentage: {Object.values(percentages).reduce((sum, p) => sum + p, 0)}%
                            </Typography>
                        </Box>
                    )}

                    {settleType === 'Dynamic' && group && (
                        <Box>
                            {sortedUsers.map((user) => (
                                <Box key={user.id} sx={{ mb: 2 }}>
                                    <TextField
                                        label={user.id === fixedUserId ? 'My Amount (€)' : `${user.name}'s Amount (€)`}
                                        type="number"
                                        value={amounts[user.id] || ''}
                                        onChange={(e) => handleAmountChange(user.id, e.target.value)}
                                        fullWidth
                                        inputProps={{ min: 0 }}
                                    />
                                </Box>
                            ))}
                            <Typography>
                                Total Amount: €{Object.values(amounts).reduce((sum, a) => sum + a, 0).toFixed(2)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSettleModal}>Cancel</Button>
                    <Button onClick={handleSettleDebt} variant="contained" disabled={loading}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default GroupDetails;