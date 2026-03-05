import { useMemo, useState } from 'react';
import { Box, Typography, Paper, Alert, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion } from 'framer-motion';
import TodayIcon from '@mui/icons-material/Today';
// @ts-ignore
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

export default function ProjectGantt() {
    const { t, i18n } = useTranslation();
    const { projects } = useProjectStore();
    const { ganttViewMode, setGanttViewMode } = useSettingsStore();
    const [viewDate, setViewDate] = useState<Date>(new Date());

    const viewMode = (ganttViewMode as ViewMode) || ViewMode.Month;

    const validProjects = useMemo(() => {
        return projects.filter(p => p.startDate && p.endDate);
    }, [projects]);

    const tasks: Task[] = useMemo(() => {
        if (validProjects.length === 0) {
            // gantt-task-react needs at least one task to not crash
            return [{
                start: new Date(),
                end: new Date(),
                name: 'Empty',
                id: 'empty',
                type: 'project',
                progress: 0,
                isDisabled: true,
                styles: { progressColor: 'transparent', progressSelectedColor: 'transparent' }
            }];
        }

        return validProjects.map(p => ({
            start: new Date(p.startDate as string),
            end: new Date(p.endDate as string),
            name: p.title,
            id: p.id,
            type: 'project',
            progress: 0,
            isDisabled: false,
            styles: {
                progressColor: p.color || '#1976d2',
                progressSelectedColor: p.color || '#1976d2',
                backgroundColor: p.color || '#1976d2',
                backgroundSelectedColor: p.color || '#1976d2'
            }
        }));
    }, [validProjects]);

    const handleViewModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newViewMode: ViewMode | null,
    ) => {
        if (newViewMode !== null) {
            setGanttViewMode(newViewMode);
        }
    };

    const handleTodayClick = () => {
        // We use a small timeout trick to force re-render if already somewhat near today
        setViewDate(new Date(Date.now() - 1000));
        setTimeout(() => {
            setViewDate(new Date());
        }, 10);
    };

    const hasRealTasks = validProjects.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }} // Calculate height considering header/navbar
        >
            <Paper
                elevation={0}
                className="glass-paper"
                sx={{
                    mb: 2,
                    p: 2,
                    flexShrink: 0
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary' }}>
                            {t('navigation.gantt', 'Gantt-Diagramm')}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<TodayIcon />}
                            onClick={handleTodayClick}
                            sx={{
                                borderRadius: 2,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    background: 'transparent'
                                }
                            }}
                        >
                            Heute
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('navigation.gantt_view', 'Ansicht')}:
                        </Typography>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            aria-label="view mode"
                            size="small"
                        >
                            <ToggleButton value={ViewMode.Day} aria-label="day">
                                {t('navigation.view_modes.day', 'Tag')}
                            </ToggleButton>
                            <ToggleButton value={ViewMode.Week} aria-label="week">
                                {t('navigation.view_modes.week', 'Woche')}
                            </ToggleButton>
                            <ToggleButton value={ViewMode.Month} aria-label="month">
                                {t('navigation.view_modes.month', 'Monat')}
                            </ToggleButton>
                            <ToggleButton value={ViewMode.QuarterYear} aria-label="quarter">
                                {t('navigation.view_modes.quarter', 'Quartal')}
                            </ToggleButton>
                            <ToggleButton value={ViewMode.Year} aria-label="year">
                                {t('navigation.view_modes.year', 'Jahr')}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            </Paper>

            {!hasRealTasks ? (
                <Alert severity="info" sx={{ flexShrink: 0 }}>
                    Keine Projekte mit Start- und Enddatum gefunden. Bitte füge Daten zu deinen Projekten hinzu, um sie hier anzuzeigen.
                </Alert>
            ) : (
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        overflow: 'hidden', // Stop double scrollbars, let internal container handle it
                        backgroundColor: 'background.paper',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        '& > div': { flexGrow: 1, display: 'flex', flexDirection: 'column' }
                    }}
                >
                    <Gantt
                        tasks={tasks}
                        viewMode={viewMode}
                        viewDate={viewDate}
                        locale={i18n.language}
                        listCellWidth=""
                        columnWidth={
                            viewMode === ViewMode.QuarterYear ? 120 :
                                viewMode === ViewMode.Month ? 150 :
                                    viewMode === ViewMode.Week ? 150 : 60
                        }
                        ganttHeight={0} // Setting to 0 triggers internal calculation for full height of container
                    />
                </Paper>
            )}
        </motion.div>
    );
}
