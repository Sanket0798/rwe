export const SUPERADMINS = {
    'shalini.purwar@immunoact.com': {
        password: 'superadmin123',
        name: 'Shalini',
        role: 'superadmin',
    },
    'naman.totala@immunoact.com': {
        password: 'superadmin123',
        name: 'Naman',
        role: 'superadmin',
    },
    'somanshi.shukla@immunoact.com': {
        password: 'superadmin123',
        name: 'Somanshi',
        role: 'superadmin',
    },
    'blessy.Varghese@immunoact.com': {
        password: 'superadmin123',
        name: 'Blessy',
        role: 'superadmin',
    },
    'sakshi.jain@immunoact.com': {
        password: 'superadmin123',
        name: 'Sakshi',
        role: 'superadmin',
    },
    'rahul.purwar@immunoact.com': {
        password: 'superadmin123',
        name: 'Rahul Purwar',
        role: 'superadmin',
    },
    'shirish.arya@immunoact.com': {
        password: 'superadmin123',
        name: 'Shirish Arya',
        role: 'superadmin',
    },
    'dr.hasmukh@immunoact.com': {
        password: 'superadmin123',
        name: 'Dr Hasmukh',
        role: 'superadmin',
    },
    'rajat.maheshwari@immunoact.com': {
        password: 'superadmin123',
        name: 'Rajat Maheshwari',
        role: 'superadmin',
    },
    'satyen.amin@immunoact.com': {
        password: 'superadmin123',
        name: 'Satyen Amin',
        role: 'superadmin',
    },
    'simpson.emmanuel@immunoact.com': {
        password: 'superadmin123',
        name: 'Simpson Emmanuel',
        role: 'superadmin',
    },
    'brian.bernard@immunoact.com': {
        password: 'superadmin123',
        name: 'Brian Bernard',
        role: 'superadmin',
    },
    'amritansh.frank@immunoact.com': {
        password: 'superadmin123',
        name: 'Amritansh Frank',
        role: 'superadmin',
    },
    'devanshi.kalra@immunoact.com': {
        password: 'superadmin123',
        name: 'Devanshi Kalra',
        role: 'superadmin',
    },
};

// Helper function to validate superadmin credentials
export const validateSuperadmin = (email, password) => {
    const superadmin = SUPERADMINS[email.toLowerCase()];
    return superadmin && superadmin.password === password ? superadmin : null;
};