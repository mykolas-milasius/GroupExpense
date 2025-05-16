import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, TextField, Alert } from '@mui/material';

interface Group {
    id: number;
    title: string;
    balance: number;
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
                    throw new Error('Nepavyko gauti grupių');
                }
                const data: Group[] = await response.json();
                setGroups(data);
            } catch (err) {
                setError('Klaida gaunant grupes: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroupTitle.trim()) {
            setError('Grupės pavadinimas yra privalomas');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5253/api/Groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newGroupTitle })
            });
            if (!response.ok) {
                throw new Error('Nepavyko sukurti grupės');
            }
            const createdGroup: Group = await response.json();
            setGroups([...groups, { id: createdGroup.id, title: createdGroup.title, balance: 0 }]);
            setNewGroupTitle('');
        } catch (err) {
            setError('Klaida kuriant grupę: ' + (err as Error).message);
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
                    Grupės
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Sveiki atvykę į grupių puslapį! Čia matote savo grupes ir balansą.
                </Typography>
                <Box sx={{ mb: 4 }}>
                    <TextField
                        label="Grupės pavadinimas"
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
                        {loading ? 'Kuriama...' : 'Sukurti naują grupę'}
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
                                <TableCell>Pavadinimas</TableCell>
                                <TableCell>Balansas</TableCell>
                                <TableCell>Veiksmai</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Kraunama...
                                    </TableCell>
                                </TableRow>
                            ) : groups.length > 0 ? (
                                groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.id}</TableCell>
                                        <TableCell>{group.title}</TableCell>
                                        <TableCell>
                                            {group.balance > 0 ? (
                                                <Typography color="green">
                                                    Jums skolingi: €{group.balance.toFixed(2)}
                                                </Typography>
                                            ) : group.balance < 0 ? (
                                                <Typography color="red">
                                                    Jūs skolingi: €{Math.abs(group.balance).toFixed(2)}
                                                </Typography>
                                            ) : (
                                                <Typography>
                                                    Balansas: €0.00
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleViewDetails(group.id)}
                                            >
                                                Peržiūrėti detales
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Grupių nerasta
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