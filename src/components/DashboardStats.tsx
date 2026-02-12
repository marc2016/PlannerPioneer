import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore';
import { useModuleStore } from '../store/useModuleStore';
import { useFeatureStore } from '../store/useFeatureStore';

export const DashboardStats = () => {
    const { t } = useTranslation();
    const { projects, init: initProjects } = useProjectStore();
    const { modules, init: initModules } = useModuleStore();
    const { features, init: initFeatures } = useFeatureStore();

    useEffect(() => {
        initProjects();
        initModules();
        initFeatures();
    }, [initProjects, initModules, initFeatures]);

    const stats = [
        {
            label: t('dashboard.total_projects'),
            value: projects.length,
            color: 'var(--primary-color, #2196f3)'
        },
        {
            label: t('dashboard.total_modules'),
            value: modules.length,
            color: 'var(--secondary-color, #f44336)'
        },
        {
            label: t('dashboard.total_features'),
            value: features.length,
            color: 'var(--tertiary-color, #9c27b0)'
        }
    ];

    return (
        <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--border-radius)',
                    // backgroundColor: 'var(--card-bg)',
                    // boxShadow: 'var(--card-shadow)',
                    borderLeft: `4px solid ${stat.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</h3>
                    <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '1rem' }}>{stat.label}</p>
                </div>
            ))}
        </div>
    );
};
