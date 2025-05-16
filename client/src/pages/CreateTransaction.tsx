import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { createTransaction } from '../services/TransactionService';
import type {GroupDto} from "../models/GroupModels.ts";
import {fetchUsers} from "../services/UserService.ts";
import type {User} from "./GroupDetails.tsx";

function CreateTransaction() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<GroupDto | null>(null);
    const [transactionTitle, setTransactionTitle] = useState('');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionUserId, setTransactionUserId] = useState<number | ''>(''); // Naudotojas, atlikęs transakciją
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openSplitModal, setOpenSplitModal] = useState(false);
    const [splitType, setSplitType] = useState<'Equally' | 'Percentage' | 'Dynamic'>('Equally');
    const [percentages, setPercentages] = useState<{ [key: number]: number }>({});
    const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const fixedUserId = 1; // Hard-coded user ID (Michael)

    useEffect(() => {

        const fetchGroup = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5253/api/Groups/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch group');
                }
                const groupData: GroupDto = await response.json();
                setGroup(groupData);
            } catch (err) {
                setError('Error fetching group: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        async function getUsers(setAllUsers: (value: (((prevState: User[]) => User[]) | User[])) => void) {
            const result = await fetchGroupMembers(parseInt(id!));
            setAllUsers(result);
        }

        getUsers(setAllUsers);
        fetchGroup();
    }, [id]);

    const handleOpenSplitModal = () => {
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
            setError('Please select a user who performed the transaction');
            return;
        }
        setOpenSplitModal(true);
        setPercentages({});
        setAmounts({});
    };

    const handleCloseSplitModal = () => {
        setOpenSplitModal(false);
        setSplitType('Equally');
        setPercentages({});
        setAmounts({});
    };

    const handleSplitTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSplitType(event.target.value as 'Equally' | 'Percentage' | 'Dynamic');
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

    const handleAddTransaction = async () => {
        if (!group || !id || !transactionUserId) return;

        const amount = parseFloat(transactionAmount);

        if (splitType === 'Percentage') {
            const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
            if (totalPercentage !== 100) {
                setError('Percentages must sum to 100%');
                return;
            }
        } else if (splitType === 'Dynamic') {
            const totalAmount = Object.values(amounts).reduce((sum, a) => sum + a, 0);
            if (totalAmount !== amount) {
                setError(`Total amount must equal €${amount.toFixed(2)}`);
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);
            await createTransaction({
                transactionType: parseInt(splitType),
                groupMemberId: transactionUserId,
                percentages,
                amount: parseInt(transactionAmount),
                title: transactionTitle,
            });

            // const response = await fetch(`http://localhost:5253/api/Transaction/createTransaction`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         transactionType: parseInt(splitType),
            //         groupMemberId: transactionUserId,
            //         percentages,
            //         amount: parseInt(transactionAmount),
            //         title: transactionTitle,
            //     }),
            // });
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Failed to split transaction');
            // }
            setSuccess('Transaction created successfully');
            setTimeout(() => {
                navigate(`/groups/${id}`);
            }, 2000);
            handleCloseSplitModal();
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
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="user-select-label">Performed by</InputLabel>
                            <Select
                                labelId="user-select-label"
                                value={transactionUserId}
                                label="Performed by"
                                onChange={(e) => setTransactionUserId(Number(e.target.value))}
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>Select user</em>
                                </MenuItem>
                                {allUsers.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.id === fixedUserId ? 'Me' : user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleOpenSplitModal}
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

            {/* Split Transaction Modal */}
            <Dialog open={openSplitModal} onClose={handleCloseSplitModal} maxWidth="sm" fullWidth>
                <DialogTitle>Split Transaction</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Split Type</FormLabel>
                        <RadioGroup value={splitType} onChange={handleSplitTypeChange}>
                            <FormControlLabel value={1} control={<Radio />} label="Equally" />
                            <FormControlLabel value={2} control={<Radio />} label="Percentage" />
                            <FormControlLabel value={3} control={<Radio />} label="Dynamic" />
                        </RadioGroup>
                    </FormControl>

                    {splitType === 'Equally' && group && (
                        <Typography>
                            Each member will pay: €{(parseFloat(transactionAmount || '0') / group!.groupMembers!.length).toFixed(2)}
                        </Typography>
                    )}

                    {splitType === 'Percentage' && group && (
                        <Box>
                            {allUsers.map((user) => (
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

                    {splitType === 'Dynamic' && group && (
                        <Box>
                            {allUsers.map((user) => (
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
                    <Button onClick={handleCloseSplitModal}>Cancel</Button>
                    <Button onClick={handleAddTransaction} variant="contained" disabled={loading}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default CreateTransaction;

export async function fetchGroupMembers(groupId: number): Promise<User[]> {
    const response = await fetch(`http://localhost:5253/api/User/groupMembers/${groupId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
}