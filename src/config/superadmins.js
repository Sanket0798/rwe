export const SUPERADMINS = {
    'shalini.purwar@immunoact.com': {
        password: 'ID[DjV}ZIu]ve#QxcjU6',
        name: 'Shalini',
        role: 'superadmin',
    },
    'naman.totala@immunoact.com': {
        password: '{!V-be]])Fy=%w2OZRS.',
        name: 'Naman',
        role: 'superadmin',
    },
    'somanshi.shukla@immunoact.com': {
        password: 'J3haF}+(50CWeR^rlwgK',
        name: 'Somanshi',
        role: 'superadmin',
    },
    'blessy.Varghese@immunoact.com': {
        password: 'QeZ2;WdG$H@ehp0YK$Ml',
        name: 'Blessy',
        role: 'superadmin',
    },
    'sakshi.jain@immunoact.com': {
        password: '{5QrtVZ48D.%$D&Su+e^',
        name: 'Sakshi',
        role: 'superadmin',
    },
    'rahul.purwar@immunoact.com': {
        password: 'Gc,I+~F&0xst-4;Y0Q[p',
        name: 'Rahul Purwar',
        role: 'superadmin',
    },
    'shirish.arya@immunoact.com': {
        password: 'MB[JMM5rf^fy.QGF9bfk',
        name: 'Shirish Arya',
        role: 'superadmin',
    },
    'dr.hasmukh@immunoact.com': {
        password: 'E0cSZI@%5P(U^YfmfJT3',
        name: 'Dr Hasmukh',
        role: 'superadmin',
    },
    'rajat.maheshwari@immunoact.com': {
        password: '3[drNr^}enP]%vPC@I=V',
        name: 'Rajat Maheshwari',
        role: 'superadmin',
    },
    'satyen.amin@immunoact.com': {
        password: '5BCE]+1.gt9b3rG(baGg',
        name: 'Satyen Amin',
        role: 'superadmin',
    },
    'simpson.emmanuel@immunoact.com': {
        password: '5c9#LB+Rd;5k611Z0u]Q',
        name: 'Simpson Emmanuel',
        role: 'superadmin',
    },
    'brian.bernard@immunoact.com': {
        password: 'C6P$LK=.;OUJ~BomDc#v',
        name: 'Brian Bernard',
        role: 'superadmin',
    },
    'amritansh.frank@immunoact.com': {
        password: 'y;LCHNCt(Eb{ye7zn!AG',
        name: 'Amritansh Frank',
        role: 'superadmin',
    },
    'devanshi.kalra@immunoact.com': {
        password: 'G7]9Le~OjPR5eqLQdcYt',
        name: 'Devanshi Kalra',
        role: 'superadmin',
    },
};

// Helper function to validate superadmin credentials
export const validateSuperadmin = (email, password) => {
    const superadmin = SUPERADMINS[email.toLowerCase()];
    return superadmin && superadmin.password === password ? superadmin : null;
};