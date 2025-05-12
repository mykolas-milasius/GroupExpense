import { Container, Typography, Box } from '@mui/material';
import Button from "@mui/material/Button";

function Groups() {
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Groups
                </Typography>
                <Typography variant="body1">
                    Welcome to the group page! This is where you can create a new group, see a list of groups and how much you owe or are owed.
                </Typography>
                <Button variant="contained">Create a new group</Button>
            </Box>
        </Container>
    );
}

export default Groups;