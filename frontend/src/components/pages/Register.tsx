import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../App';
import Button from '../ui/Button';
import request from '../../services/api';
import { User } from '../../types';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const appContext = useContext(AppContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data: { user: User, token: string } = await request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });
            
            if (data.user && data.token) {
                appContext?.login(data.user, data.token);
                navigate('/dashboard');
            }

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error desconocido.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Crea tu cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ¿Ya tienes una?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Nombre</label>
                            <input
                                id="name" name="name" type="text" required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Nombre completo"
                                value={name} onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address" name="email" type="email" autoComplete="email" required
                                className="relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Email"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password" name="password" type="password" autoComplete="new-password" required
                                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Contraseña"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <Button type="submit" fullWidth isLoading={isLoading}>
                            Registrarse
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
