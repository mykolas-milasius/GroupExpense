import type {GroupDto} from "../models/GroupModels.ts";

export const handleCreateGroupp = async (newGroupTitle: string) => {
    const response = await fetch('http://localhost:5253/api/Groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newGroupTitle })
    });
    if (!response.ok) {
        throw new Error('Failed to create group');
    }
    const createdGroup: GroupDto = await response.json();
    return createdGroup;
};

export const fetchGroups = async () => {

    const response = await fetch('http://localhost:5253/api/Groups');
    if (!response.ok) {
        throw new Error('Failed to fetch groups');
    }
    const data: GroupDto[] = await response.json();
    return data;
};