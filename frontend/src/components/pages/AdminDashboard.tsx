import React, { useState, useEffect, useCallback } from 'react';
import request from '../../services/api';
import { FullUserConfiguration } from '../../types';

interface Stats {
  totalUsers: number;
  totalConfigs: number;
  totalRevenue: number;
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [configs, setConfigs] = useState<FullUserConfiguration[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsData, configsData] = await Promise.all([
                request('/api/admin/stats'),
                request('/api/admin/configurations'),
            ]);
            setStats(statsData);
            setConfigs(configsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredConfigs = configs.filter(config =>
      config.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="text-center p-12">Cargando panel de administración...</div>;
    if (error) return <div className="text-center p-12 text-red-600">Error: {error}</div>

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Administración</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <StatCard title="Ingresos Totales" value={`${stats?.totalRevenue || 0}€`} />
                <StatCard title="Usuarios Totales" value={stats?.totalUsers || 0} />
                <StatCard title="Bots Configurados" value={stats?.totalConfigs || 0} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Todas las Configuraciones</h2>
                <input
                    type="text"
                    placeholder="Buscar por negocio o email..."
                    className="w-full max-w-sm p-2 border border-gray-300 rounded-md mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredConfigs.map(config => (
                                <tr key={config.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{config.businessName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.templateTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        config.status === 'active' ? 'bg-green-100 text-green-800' : 
                                        config.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {config.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(config.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredConfigs.length === 0 && <p className="text-center text-gray-500 py-8">No se encontraron configuraciones.</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;
