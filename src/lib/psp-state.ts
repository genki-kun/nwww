import fs from 'fs';
import path from 'path';

// Define the state file path
// Using /tmp for now to avoid polluting the repo, or a hidden file in the project
const STATE_FILE_PATH = path.join(process.cwd(), '.psp-approval-state.json');

export type ApprovalStatus = 'IDLE' | 'WAITING' | 'APPROVED' | 'REJECTED';

export interface ApprovalState {
    status: ApprovalStatus;
    message: string;
    timestamp: number;
}

const DEFAULT_STATE: ApprovalState = {
    status: 'IDLE',
    message: '',
    timestamp: Date.now(),
};

export function getApprovalState(): ApprovalState {
    try {
        if (!fs.existsSync(STATE_FILE_PATH)) {
            return DEFAULT_STATE;
        }
        const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        return JSON.parse(data) as ApprovalState;
    } catch (error) {
        console.error('Error reading approval state:', error);
        return DEFAULT_STATE;
    }
}

export function setApprovalState(status: ApprovalStatus, message: string = ''): void {
    const newState: ApprovalState = {
        status,
        message,
        timestamp: Date.now(),
    };
    try {
        fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(newState, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing approval state:', error);
    }
}
