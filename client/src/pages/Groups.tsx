import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Group {
    id: number;
    name: string;
    description: string;
}

function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch('http://localhost:5253/api/Groups');
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data: Group[] = await response.json();
                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Groups
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Welcome to the group page! This is where you can create a new group, see a list of groups and how much you owe or are owed.
                </Typography>
                <Button variant="contained" sx={{ mb: 4 }}>
                    Create a new group
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.length > 0 ? (
                                groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.id}</TableCell>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.description}</TableCell>
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