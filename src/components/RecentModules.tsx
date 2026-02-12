import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useModuleStore } from '../store/useModuleStore';
import { useNavigate } from 'react-router-dom';

export const RecentModules = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { modules, init: initModules } = useModuleStore();

    useEffect(() => {
        initModules();
    }, [initModules]);

    const recentModules = [...modules].sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA;
    }).slice(0, 5);

    if (recentModules.length === 0) {
        return null;
    }

    return (
        <div className="recent-modules">
            <h3>{t('dashboard.recent_modules')}</h3>
            <div className="module-list" style={{ display: 'grid', gap: '0.5rem' }}>
                {recentModules.map(module => (
                    <div
                        key={module.id}
                        className="module-item"
                        onClick={() => navigate('/modules')} // Navigate to modules page
                        style={{
                            padding: '1rem',
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            borderLeft: `4px solid ${module.color || 'var(--secondary-color)'}`
                            // Background handled by parent container's glass-panel or transparent if intended
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{module.title}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                {module.description || t('modules.no_description')}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                            {new Date(module.updatedAt || module.createdAt || 0).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
