import type {TransactionDto} from "../models/TransactionModel.ts";

export async function createTransaction(transaction: Omit<TransactionDto, 'id' | 'date'>): Promise<TransactionDto> {
    const response = await fetch('http://localhost:5253/api/Transactions/createTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
    if (!response.ok) {
        throw new Error('Failed to create transaction');
    }
    return response.json();
}

export async function fetchTransactionsByGroup(groupId: number): Promise<TransactionDto[]> {
    const response = await fetch(`http://localhost:5253/api/Transactions/group/${groupId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }
    return response.json();
}