const fs = require('fs');
const path = require('path');

const STATE_FILE_PATH = path.join(process.cwd(), '.psp-approval-state.json');

function getApprovalState() {
    try {
        if (!fs.existsSync(STATE_FILE_PATH)) {
            return { status: 'IDLE' };
        }
        const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { status: 'IDLE' };
    }
}

function setApprovalState(status, message) {
    const newState = {
        status,
        message,
        timestamp: Date.now(),
    };
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(newState, null, 2), 'utf-8');
}

async function waitForApproval(message) {
    console.log(`\n[PSP COMMANDER] Requesting Approval: ${message}`);
    setApprovalState('WAITING', message);

    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            const state = getApprovalState();

            if (state.status === 'APPROVED') {
                clearInterval(checkInterval);
                console.log('[PSP COMMANDER] APPROVED! Proceeding...');
                setApprovalState('IDLE', ''); // Reset after approval
                resolve(true);
            } else if (state.status === 'REJECTED') {
                clearInterval(checkInterval);
                console.log('[PSP COMMANDER] REJECTED! Aborting...');
                setApprovalState('IDLE', ''); // Reset after rejection
                resolve(false);
            }

            // Optional: Add timeout logic here
        }, 1000);
    });
}

// Check if run directly
if (require.main === module) {
    const msg = process.argv[2] || 'Generic Approval Request';
    waitForApproval(msg).then((approved) => {
        process.exit(approved ? 0 : 1);
    });
}

module.exports = { waitForApproval };
