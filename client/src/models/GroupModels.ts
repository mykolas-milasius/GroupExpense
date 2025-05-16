export interface GroupDto {
    id: number;
    title: string;
    groupMembers?: GroupMembersDto[];
}

export interface GroupMembersDto {
    id: number;
    name: string;
    amount: number | null;
}

