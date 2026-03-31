import { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    FormControl,
    Select,
    MenuItem,
    Grid,
    useTheme,
    Alert,
    Paper
} from '@mui/material';
import { Treemap, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore';
import { useModuleStore } from '../store/useModuleStore';
import { useFeatureStore } from '../store/useFeatureStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion } from 'framer-motion';
import ModuleDrawer from '../components/ModuleDrawer';
import FeatureDrawer from '../components/FeatureDrawer';

// Customized Treemap Content
const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, name, featureColor, color, fill, tShirtSize } = props;

    // We only render depth 1 (Modules) or depth 2 (Features)
    const isModule = depth === 1;
    const isFeature = depth === 2;
    const bgColor = featureColor || color || fill || '#ccc';

    // Fallback simple colors if depth is 1
    const moduleColor = isModule ? (bgColor !== '#ccc' ? bgColor : '#1976d2') : 'transparent';

    return (
        <g>

            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: isFeature ? bgColor : moduleColor,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1,
                    fillOpacity: isModule ? 1 : 0
                }}
            />
            {
                width > 30 && height > 30 && isFeature ? (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        style={{ pointerEvents: 'none' }}
                    >
                        {name}
                    </text>
                ) : null
            }
            {
                width > 50 && height > 50 && isModule ? (

                    <text
                        x={x + 10}
                        y={y + 21}
                        fill="#fff"
                        fontSize={16}
                        style={{ pointerEvents: 'none' }}
                    >
                        {name} {tShirtSize ? `(${tShirtSize})` : ''}
                    </text>

                ) : null
            }
        </g >
    );
};


export default function ProjectStructure() {
    const { t } = useTranslation();
    const theme = useTheme();
    const { projects } = useProjectStore();
    const { modules } = useModuleStore();
    const { features } = useFeatureStore();
    const { selectedProjectId, setSelectedProjectId } = useSettingsStore();

    const [moduleDrawerOpen, setModuleDrawerOpen] = useState(false);
    const [selectedModuleForDrawer, setSelectedModuleForDrawer] = useState<any>(null);

    const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);
    const [selectedFeatureForDrawer, setSelectedFeatureForDrawer] = useState<any>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleChartClick = (data: any) => {
        if (!data) return;
        
        // recharts passes the event differently depending on the chart type.
        // It might be directly `data` (Treemap node or Pie slice),
        // or inside `activePayload` (BarChart).
        let target = data;
        if (data && data.activePayload && data.activePayload.length > 0) {
            target = data.activePayload[0].payload;
        } else if (data && data.payload) {
            target = data.payload;
        }
        
        // For Treemap, custom content might put raw data inside root or depth. 
        // We ensure rawFeature / rawModule are on target.
        if (target?.isFeature && target?.rawFeature) {
            setSelectedFeatureForDrawer(target.rawFeature);
            setFeatureDrawerOpen(true);
        } else if (target?.isModule && target?.rawModule) {
            setSelectedModuleForDrawer(target.rawModule);
            setModuleDrawerOpen(true);
        }
    };

    const data = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return [];

        const projectModules = modules.filter(m => m.project_id === selectedProjectId);

        return projectModules.map(mod => {
            const moduleFeatures = features.filter(f => f.module_id === mod.id);
            const children = moduleFeatures.map(feat => ({
                isFeature: true,
                rawFeature: feat,
                name: feat.title,
                size: feat.expected_duration ? Math.max(feat.expected_duration, 0.1) : 0.1, // Treemap needs size > 0
                featureColor: feat.color || theme.palette.primary.main,
                color: feat.color || theme.palette.primary.main,
                duration: feat.expected_duration || 0,
            }));

            // Calculate module total duration
            const moduleDuration = children.reduce((sum, child) => sum + child.duration, 0);

            return {
                isModule: true,
                rawModule: mod,
                name: mod.title,
                featureColor: mod.color || theme.palette.secondary.main,
                color: mod.color || theme.palette.secondary.main,
                tShirtSize: mod.tShirtSize,
                children: children.length > 0 ? children : [{ name: t('common.no_features', 'Keine Items'), size: 0.1, featureColor: '#e0e0e0', color: '#e0e0e0', duration: 0 }],
                duration: moduleDuration
            };
        });
    }, [selectedProjectId, modules, features, t, theme]);

    const modulePieData = useMemo(() => {
        return data.map(mod => ({
            isModule: true,
            rawModule: mod.rawModule,
            name: mod.name,
            value: mod.duration,
            color: mod.color
        })).filter(mod => mod.value > 0);
    }, [data]);

    const totalDuration = selectedProject?.totalDuration || 0;
    
    const projectFeaturesCount = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return 0;
        const projectModules = modules.filter(m => m.project_id === selectedProjectId);
        return projectModules.reduce((acc, mod) => {
            return acc + features.filter(f => f.module_id === mod.id).length;
        }, 0);
    }, [selectedProjectId, modules, features]);

    const riskData = useMemo(() => {
        if (!selectedProject || !selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return [];

        let projectVariance = 0;
        const projectModules = modules.filter(m => m.project_id === selectedProjectId);
        projectModules.forEach(mod => {
            const moduleFeatures = features.filter(f => f.module_id === mod.id);
            moduleFeatures.forEach(feat => {
                projectVariance += (Number(feat.variance) || 0);
            });
        });

        const stdDev = Math.sqrt(projectVariance);
        const baseDuration = selectedProject.totalDuration || 0;
        const factors = selectedProject.factors || [];
        const factorDuration = factors.reduce((acc, factor) => acc + (baseDuration * (factor.value / 100)), 0);
        const expectedD = baseDuration + factorDuration;

        return [
            { name: t('table.columns.expected', 'Erwartet'), value: Number(expectedD.toFixed(1)), fill: theme.palette.info.main },
            { name: '1-Sigma (68%)', value: Number((expectedD + stdDev).toFixed(1)), fill: theme.palette.success.main },
            { name: '2-Sigma (95%)', value: Number((expectedD + 2 * stdDev).toFixed(1)), fill: theme.palette.warning.main },
            { name: '3-Sigma (99%)', value: Number((expectedD + 3 * stdDev).toFixed(1)), fill: theme.palette.error.main }
        ];
    }, [selectedProjectId, modules, features, selectedProject, t, theme]);

    const tShirtData = useMemo(() => {
        if (!selectedProject || !selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return [];

        const projectModules = modules.filter(m => m.project_id === selectedProjectId);
        const counts = {
            'None': 0,
            'S': 0,
            'M': 0,
            'L': 0,
            'XL': 0
        };

        projectModules.forEach(mod => {
            const size = mod.tShirtSize || 'None';
            if (counts[size as keyof typeof counts] !== undefined) {
                counts[size as keyof typeof counts]++;
            }
        });

        // Only include sizes that have at least one module (or keep all so the axis is consistent?)
        // Let's keep all for scale consistency.
        return [
            { name: '-', value: counts['None'], fill: theme.palette.grey[400] },
            { name: 'S', value: counts['S'], fill: theme.palette.success.light },
            { name: 'M', value: counts['M'], fill: theme.palette.info.light },
            { name: 'L', value: counts['L'], fill: theme.palette.warning.light },
            { name: 'XL', value: counts['XL'], fill: theme.palette.error.light }
        ];
    }, [selectedProjectId, modules, selectedProject, theme]);

    const featureComparisonData = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return [];
        
        const projectModules = modules.filter(m => m.project_id === selectedProjectId);
        const projectFeatures = projectModules.flatMap(mod => features.filter(f => f.module_id === mod.id));
        
        return projectFeatures
            .filter(f => f.pert_optimistic || f.actualDuration) // Only show features with estimates or actual times
            .map(f => {
                const opt = f.pert_optimistic || 0;
                const likely = f.pert_most_likely || opt;
                const pes = f.pert_pessimistic || likely;

                return {
                    isFeature: true,
                    rawFeature: f,
                    name: f.title,
                    Optimistisch: opt,
                    'Zusatz Wahrscheinlich': likely - opt > 0 ? (likely - opt) : 0,
                    'Zusatz Pessimistisch': pes - likely > 0 ? (pes - likely) : 0,
                    'Tatsächlich': f.actualDuration || 0,
                    // Store absolute values for the tooltip
                    absOpt: opt,
                    absLikely: likely,
                    absPes: pes
                };
            })
            // Sort by absolute likely duration descending for better visual
            .sort((a, b) => b.absLikely - a.absLikely);
    }, [selectedProjectId, modules, features]);

    const moduleComparisonData = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return [];

        const projectModules = modules.filter(m => m.project_id === selectedProjectId);

        return projectModules.map(mod => {
            const moduleFeatures = features.filter(f => f.module_id === mod.id);
            
            // Sum up values from features
            const sumOpt = moduleFeatures.reduce((sum, f) => sum + (f.pert_optimistic || 0), 0);
            const sumLikely = moduleFeatures.reduce((sum, f) => sum + (f.pert_most_likely || (f.pert_optimistic || 0)), 0);
            const sumPes = moduleFeatures.reduce((sum, f) => sum + (f.pert_pessimistic || (f.pert_most_likely || (f.pert_optimistic || 0))), 0);
            
            // Actual duration logic: check module directly, otherwise sum features
            let actual = mod.actualDuration;
            if (!actual || actual <= 0) {
                actual = moduleFeatures.reduce((sum, f) => sum + (f.actualDuration || 0), 0);
            }

            return {
                isModule: true,
                rawModule: mod,
                name: mod.title,
                Optimistisch: sumOpt,
                'Zusatz Wahrscheinlich': sumLikely - sumOpt > 0 ? (sumLikely - sumOpt) : 0,
                'Zusatz Pessimistisch': sumPes - sumLikely > 0 ? (sumPes - sumLikely) : 0,
                'Tatsächlich': actual,
                // Store absolute values for the tooltip
                absOpt: sumOpt,
                absLikely: sumLikely,
                absPes: sumPes
            };
        })
        .filter(d => d.absOpt > 0 || d['Tatsächlich'] > 0)
        .sort((a, b) => b.absLikely - a.absLikely);
    }, [selectedProjectId, modules, features]);

    // Custom tool tip for the feature comparison to show absolute values instead of just the segments
    const CustomComparisonTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: 0, color: theme.palette.success.main }}>Optimistisch: {data.absOpt.toFixed(1)} h</p>
                    <p style={{ margin: 0, color: theme.palette.info.main }}>Wahrscheinlich: {data.absLikely.toFixed(1)} h</p>
                    <p style={{ margin: 0, color: theme.palette.warning.main }}>Pessimistisch: {data.absPes.toFixed(1)} h</p>
                    <p style={{ margin: '5px 0 0 0', color: theme.palette.secondary.main, fontWeight: 'bold' }}>Tatsächlich: {data['Tatsächlich'].toFixed(1)} h</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={0}
                className="glass-paper"
                sx={{
                    mb: 4,
                    p: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary', mr: 2 }}>
                        {t('structure.title')}
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <Select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            {projects.map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: p.color || 'primary.main' }} />
                                        {p.title}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {(!selectedProject || data.length === 0) ? (
                <Alert severity="info">{t('structure.no_data')}</Alert>
            ) : (
                <Grid container spacing={4}>
                    {/* Treemap for overall composition */}
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                                    {t('structure.composition_treemap', 'Struktur (Module & Items)')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <Treemap
                                            data={data}
                                            dataKey="size"
                                            stroke="#fff"
                                            fill="#8884d8"
                                            content={<CustomizedContent />}
                                            onClick={handleChartClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Tooltip
                                                formatter={(_value: any, _name: any, props: any) => {
                                                    const duration = props?.payload?.duration;
                                                    return [`${duration ? duration.toFixed(1) : 0} h`, 'Dauer'];
                                                }}
                                            />
                                        </Treemap>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* PieChart for Module comparison */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                                    {t('structure.module_distribution', 'Modulanteile (Dauer)')}
                                </Typography>
                                {modulePieData.length > 0 ? (
                                    <Box sx={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={modulePieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    onClick={handleChartClick}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {modulePieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || theme.palette.primary.main} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(val: number | string | undefined) => [`${Number(val || 0).toFixed(1)} h`, 'Dauer']} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">
                                            {t('structure.no_durations', 'Keine Dauerschätzungen vorhanden')}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Deviation Risk Chart */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                                    {t('structure.deviation_risk', 'Abweichungsrisiko')}
                                </Typography>
                                {riskData.length > 0 ? (
                                    <Box sx={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={riskData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={40} />
                                                <Tooltip formatter={(value: any) => [`${Number(value || 0).toFixed(1)} h`, 'Dauer']} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {riskData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <LabelList dataKey="value" position="top" formatter={(val: any) => `${Number(val || 0).toFixed(1)}h`} style={{ fill: '#666', fontSize: 11, fontWeight: 'bold' }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">
                                            {t('structure.no_durations', 'Keine Dauerschätzungen vorhanden')}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* T-Shirt Size Distribution Chart */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                                    {t('structure.t_shirt_distribution', 'T-Shirt Größen (Module)')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={tShirtData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                                            <Tooltip formatter={(value: any) => [`${value} Module`, 'Anzahl']} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {tShirtData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => val > 0 ? val : ''} style={{ fill: '#666', fontSize: 11, fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Summary Info Box */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.dark">
                                    {selectedProject.title}
                                </Typography>
                                {(selectedProject.startDate || selectedProject.endDate) && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {t('projects.time_period', 'Zeitraum')}: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : '...'} - {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : '...'}
                                    </Typography>
                                )}
                                <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                                    {t('structure.total_modules', 'Anzahl Module')}: <strong>{data.length}</strong>
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {t('structure.total_features', 'Anzahl Features')}: <strong>{projectFeaturesCount}</strong>
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {t('projects.total_duration', 'Gesamtdauer')}: <strong>{totalDuration.toFixed(1)} h</strong>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Module Estimate vs Actual Chart */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                                    {t('structure.module_comparison', 'Modul Schätzungen vs. Tatsächlich')}
                                </Typography>
                                {moduleComparisonData.length > 0 ? (
                                    <Box sx={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={moduleComparisonData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }} onClick={handleChartClick}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 11 }} 
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={40} />
                                                <Tooltip content={<CustomComparisonTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                                                
                                                {/* Estimated Values Stacked */}
                                                <Bar dataKey="Optimistisch" stackId="expected" fill={theme.palette.success.main} radius={[0, 0, 4, 4]} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                <Bar dataKey="Zusatz Wahrscheinlich" name="Wahrscheinlich" stackId="expected" fill={theme.palette.info.main} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                <Bar dataKey="Zusatz Pessimistisch" name="Pessimistisch" stackId="expected" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                
                                                {/* Actual Value Non-Stacked */}
                                                <Bar dataKey="Tatsächlich" fill={theme.palette.secondary.main} radius={4} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">
                                            {t('structure.no_durations', 'Keine Dauerschätzungen vorhanden')}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Feature Estimate vs Actual Chart */}
                    <Grid size={{ xs: 12, lg: 12 }}>
                        <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                                    {t('structure.feature_comparison', 'Feature Schätzungen vs. Tatsächlich')}
                                </Typography>
                                {featureComparisonData.length > 0 ? (
                                    <Box sx={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={featureComparisonData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }} onClick={handleChartClick}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 11 }}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={40} />
                                                <Tooltip content={<CustomComparisonTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                                                
                                                {/* Estimated Values Stacked */}
                                                <Bar dataKey="Optimistisch" stackId="expected" fill={theme.palette.success.main} radius={[0, 0, 4, 4]} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                <Bar dataKey="Zusatz Wahrscheinlich" name="Wahrscheinlich" stackId="expected" fill={theme.palette.info.main} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                <Bar dataKey="Zusatz Pessimistisch" name="Pessimistisch" stackId="expected" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                                
                                                {/* Actual Value Non-Stacked */}
                                                <Bar dataKey="Tatsächlich" fill={theme.palette.secondary.main} radius={4} onClick={handleChartClick} style={{ cursor: 'pointer' }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">
                                            {t('structure.no_durations', 'Keine Dauerschätzungen vorhanden')}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {selectedModuleForDrawer && (
                <ModuleDrawer
                    open={moduleDrawerOpen}
                    onClose={() => setModuleDrawerOpen(false)}
                    module={selectedModuleForDrawer}
                    initialProjectId={selectedProjectId}
                />
            )}

            {selectedFeatureForDrawer && (
                <FeatureDrawer
                    open={featureDrawerOpen}
                    onClose={() => setFeatureDrawerOpen(false)}
                    feature={selectedFeatureForDrawer}
                    initialModuleId={selectedFeatureForDrawer.module_id}
                />
            )}
        </motion.div>
    );
}
