export const SUPERADMINS = {
    'shalini.purwar@actelligence.com': {
        password: 'superadmin123',
        name: 'Shalini',
        role: 'superadmin',
    },
    'naman.totala@actelligence.com': {
        password: 'superadmin123',
        name: 'Naman',
        role: 'superadmin',
    },
    'somanshi.shukla@actelligence.com': {
        password: 'superadmin123',
        name: 'Somanshi',
        role: 'superadmin',
    },
    'blessy.Varghese@actelligence.com': {
        password: 'superadmin123',
        name: 'Blessy',
        role: 'superadmin',
    },
    'sakshi.jain@actelligence.com': {
        password: 'superadmin123',
        name: 'Sakshi',
        role: 'superadmin',
    },
};

// Helper function to validate superadmin credentials
export const validateSuperadmin = (email, password) => {
    const superadmin = SUPERADMINS[email.toLowerCase()];
    return superadmin && superadmin.password === password ? superadmin : null;
};