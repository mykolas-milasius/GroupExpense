import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    TextField,
    Alert
} from '@mui/material';
import type {GroupDto} from "../models/GroupModels.ts";
import {fetchGroups} from "../services/GroupService.ts";
import {handleCreateGroupp} from "../services/GroupService.ts";


function Groups() {
    const [groups, setGroups] = useState<GroupDto[]>([]);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadGroups = async () => {
            setLoading(true);
            try {
                const groups = await fetchGroups();
                setGroups(groups ?? []);
            } catch (err) {
                setError('Error loading groups: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, []);

    const handleCreateGroup  = async () => {
        if (!newGroupTitle.trim()) {
            setError('Group title is required');
            return;
        }

        try{
            setLoading(true);
            setError(null);
            const createdGroup = await handleCreateGroupp(newGroupTitle);
            setGroups([...groups, createdGroup]);
        }
        catch (err) {
            setError('Error creating group: ' + (err as Error).message);
        }
        finally{
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
                    Welcome to the groups page! Here you can view your groups and their balances.
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
                        {loading ? 'Creating...' : 'Create New Group'}
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
                                    <TableCell colSpan={4} align="center">
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
                                    <TableCell colSpan={4} align="center">
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