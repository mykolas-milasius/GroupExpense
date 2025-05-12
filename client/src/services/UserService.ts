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