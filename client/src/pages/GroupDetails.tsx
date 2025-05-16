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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    const [allUsers, setAllUsers] = useState<User[]>([]); // Visi sistemos naudotojai
    const [selectedUserId, setSelectedUserId] = useState<number | ''>(''); // Pasirinktas naudotojas pridėjimui
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openSettleModal, setOpenSettleModal] = useState(false);
    const [openAddUserModal, setOpenAddUserModal] = useState(false); // Modalas naudotojo pridėjimui
    const [settleAmount, setSettleAmount] = useState('');
    const fixedUserId = 1; // Hard-coded user ID (Michael)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Gauname grupės informaciją
                const groupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
                if (!groupResponse.ok) {
                    throw new Error('Failed to fetch group');
                }
                const groupData: Group = await groupResponse.json();
                setGroup(groupData);

                // Gauname transakcijas
                const transactionsData = await fetchTransactionsByGroup(parseInt(id!));
                setTransactions(transactionsData);

                // Gauname visus naudotojus
                const usersData = await fetchUsers();
                setAllUsers(usersData);
            } catch (err) {
                setError('Error fetching data: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleOpenAddUserModal = () => {
        setOpenAddUserModal(true);
        setSelectedUserId(''); // Išvalome pasirinkimą
    };

    const handleCloseAddUserModal = () => {
        setOpenAddUserModal(false);
        setSelectedUserId('');
    };

    const handleAddUser = async () => {
        if (!group || !selectedUserId) return;

        if (group.users.some((u) => u.id === selectedUserId)) {
            setError('This user is already a member of the group');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:5253/api/Groups/${id}/users/${selectedUserId}`, {
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
            handleCloseAddUserModal();
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
        setSettleAmount('');
    };

    const handleCloseSettleModal = () => {
        setOpenSettleModal(false);
        setSettleAmount('');
    };

    const handleSettleDebt = async () => {
        if (!group) return;

        const amount = parseFloat(settleAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount greater than zero');
            return;
        }
        if (amount > Math.abs(group.balance)) {
            setError(`Amount cannot exceed your debt of €${Math.abs(group.balance).toFixed(2)}`);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:5253/api/Groups/${id}/settle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settleType: 'Dynamic',
                    percentages: {},
                    amounts: { [fixedUserId]: amount },
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to settle debt');
            }
            const updatedGroupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
            const updatedGroup: Group = await updatedGroupResponse.json();
            setGroup(updatedGroup);
            setSuccess('Debt settled successfully');
            setTimeout(() => setSuccess(null), 3000);
            handleCloseSettleModal();
        } catch (err) {
            setError('Error settling debt: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Filtruojame naudotojus, kurie dar nėra grupėje
    const availableUsers = allUsers.filter((user) => !group?.users.some((u) => u.id === user.id));

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
                                            sx={{ textTransform: 'none' }}
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
                                onClick={handleOpenAddUserModal}
                                disabled={loading || availableUsers.length === 0}
                                sx={{ textTransform: 'none' }}
                            >
                                Add Member to Group
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNewTransaction}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                New Transaction
                            </Button>
                        </Box>
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleBack}
                            sx={{ textTransform: 'none' }}
                        >
                            Back to Groups
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Group not found
                    </Alert>
                )}
            </Box>

            {/* Add User Modal */}
            <Dialog open={openAddUserModal} onClose={handleCloseAddUserModal} maxWidth="sm" fullWidth>
                <DialogTitle>Add Member to Group</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="user-select-label">Select User</InputLabel>
                        <Select
                            labelId="user-select-label"
                            value={selectedUserId}
                            label="Select User"
                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        >
                            <MenuItem value="">
                                <em>Select a user</em>
                            </MenuItem>
                            {availableUsers.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddUserModal} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddUser}
                        variant="contained"
                        disabled={loading || !selectedUserId}
                        sx={{ textTransform: 'none' }}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Settle Debt Modal */}
            <Dialog open={openSettleModal} onClose={handleCloseSettleModal} maxWidth="sm" fullWidth>
                <DialogTitle>Settle Debt</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        You owe: €{group ? Math.abs(group.balance).toFixed(2) : '0.00'}
                    </Typography>
                    <TextField
                        label="Amount to Settle (€)"
                        type="number"
                        value={settleAmount}
                        onChange={(e) => setSettleAmount(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSettleModal} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSettleDebt}
                        variant="contained"
                        disabled={loading}
                        sx={{ textTransform: 'none' }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default GroupDetails;

export interface User {
    id: number;
    name: string;
}

export async function fetchUsers(): Promise<User[]> {
    const response = await fetch('http://localhost:5253/api/User');
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
}