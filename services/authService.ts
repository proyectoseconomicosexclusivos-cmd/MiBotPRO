import { User } from '../types';

// This is a MOCK authentication service that uses localStorage.
// All user data is stored in the browser.

// Initialize with a default user for demonstration
export const mockUsers: (User & { password: string })[] = [
    { id: 1, email: 'cliente@ejemplo.com', name: 'Cliente de Prueba', password: 'password123' }
];

const getUsers = (): (User & { password: string })[] => {
    try {
        const users = localStorage.getItem('mibotpro_users');
        return users ? JSON.parse(users) : mockUsers;
    } catch {
        return mockUsers;
    }
};

const saveUsers = (users: (User & { password: string })[]) => {
    localStorage.setItem('mibotpro_users', JSON.stringify(users));
};

export const login = (email: string, password: string): User | null => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        const { password, ...userToReturn } = user;
        return userToReturn;
    }
    return null;
};

export const register = (name: string, email: string, password: string): User => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Ya existe un usuario con este email.');
    }
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        password,
    };
    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userToReturn } = newUser;
    return userToReturn;
};

export const getCurrentUser = (): User | null => {
    try {
        const user = localStorage.getItem('mibotpro_currentUser');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};