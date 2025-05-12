import type { User } from './UserService';

interface Group {
    id: number;
    title: string;
    users?: User[];
}

export interface Transaction {
    id: number;
    title: string;
    amount: number;
    date: string;
    userId: number;
    groupId: number;
    user?: User;
    group?: Group;
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const response = await fetch('http://localhost:5253/api/Transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
    if (!response.ok) {
        throw new Error('Failed to create transaction');
    }
    return response.json();
}

export async function fetchTransactionsByGroup(groupId: number): Promise<Transaction[]> {
    const response = await fetch(`http://localhost:5253/api/Transactions/group/${groupId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }
    return response.json();
}