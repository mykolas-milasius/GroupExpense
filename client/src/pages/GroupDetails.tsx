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
import type { TransactionDto } from '../models/TransactionModel.ts';
import type {GroupDto} from "../models/GroupModels.ts";

function GroupDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<GroupDto | null>(null);
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
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

                const groupResponse = await fetch(`http://localhost:5253/api/Groups/${id}`);
                if (!groupResponse.ok) {
                    throw new Error('Failed to fetch group');
                }
                const groupData: GroupDto = await groupResponse.json();
                setGroup(groupData);

                const transactionsData = await fetchTransactionsByGroup(parseInt(id!));
                setTransactions(transactionsData);

                const usersData = await fetchUsers(groupData!.id);
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

        if (group.groupMembers?.some((u) => u.id === selectedUserId)) {
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
            const updatedGroup: GroupDto = await updatedGroupResponse.json();
            setGroup(updatedGroup);
            const result = await fetchUsers(group.id);
            setAllUsers(result);
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
            const updatedGroup: GroupDto = await updatedGroupResponse.json();
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

    const handleCloseSettleModal = () => {
        setOpenSettleModal(false);
        setSettleAmount('');
    };

    const availableUsers = allUsers.filter(
        (user) => !group?.groupMembers?.some((member) => member.id === user.id)
    );

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
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Members:
                        </Typography>
                        <List>
                            {group.groupMembers &&
                                group.groupMembers.length > 0 ? (
                                group?.groupMembers.map((user) => (
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
                                            primary={`${transaction.title}: €${transaction.amount.toFixed(2)} by ${transaction.groupMemberName || 'Unknown'}`}
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
                    <TextField
                        label="Amount to Settle (€)"
                        type="number"
                        value={settleAmount}
                        onChange={(e) => setSettleAmount(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0 }}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default GroupDetails;

export interface User {
    id: number;
    name: string;
}

export async function fetchUsers(groupId: number): Promise<User[]> {
    const response = await fetch(`http://localhost:5253/api/User/availableUsers/${groupId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
}