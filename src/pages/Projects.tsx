import { Box, Typography, Paper, FormControl, Select, MenuItem, TextField, InputAdornment, SpeedDial, SpeedDialIcon, SpeedDialAction, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useEffect, useState, useRef } from "react";
import { useProjectStore, Project } from "../store/useProjectStore";
import ProjectCard from "../components/ProjectCard";
import ProjectDrawer from "../components/ProjectDrawer";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

import { useTranslation } from "react-i18next";
import { importProjectData } from '../lib/projectExportImport';

export default function Projects() {
    const { projects, init, deleteProject, toggleProject } = useProjectStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'alpha' | 'duration'>('alpha');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter projects based on status and search query
    const filteredProjects = projects.filter(p => {
        if (statusFilter === 'active' && p.completed) return false;
        if (statusFilter === 'completed' && !p.completed) return false;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesTitle = p.title.toLowerCase().includes(lowerQuery);
            const matchesDesc = p.description?.toLowerCase().includes(lowerQuery) ?? false;
            if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === 'alpha') {
            return a.title.localeCompare(b.title);
        } else {
            const durA = a.totalDuration || 0;
            const durB = b.totalDuration || 0;
            return durB - durA;
        }
    });

    const activeProjects = filteredProjects.filter(p => !p.completed);
    const completedProjects = filteredProjects.filter(p => p.completed);

    const { t } = useTranslation();

    useEffect(() => {
        // initialization handled globally in RootLayout
    }, []);

    const handleAddClick = () => {
        setSelectedProject(null);
        setDrawerOpen(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await importProjectData(data);
            await init();
        } catch (e) {
            console.error('Import failed', e);
            alert(t('projects.import_failed', 'Import failed. Missing or invalid PlannerPioneer JSON format.'));
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCardClick = (project: Project) => {
        setSelectedProject(project);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedProject(null);
    };

    return (
        <Box>
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
                        {t('projects.title')}
                    </Typography>

                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder={t('search', 'Suche...') as string}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            minWidth: 200
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
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
                            <MenuItem value="all">{t('filters.all', "Alle")}</MenuItem>
                            <MenuItem value="active">{t('filters.active', "Aktiv")}</MenuItem>
                            <MenuItem value="completed">{t('filters.completed', "Abgeschlossen")}</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Sort Toggle */}
                    <ToggleButtonGroup
                        value={sortBy}
                        exclusive
                        onChange={(_, newValue) => newValue !== null && setSortBy(newValue)}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                px: 2,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }
                            },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <ToggleButton value="alpha" title={t('sort.alphabetical', 'Alphabetisch')}>
                            <SortByAlphaIcon fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="duration" title={t('sort.duration', 'Dauer')}>
                            <AccessTimeIcon fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.total')} <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{projects.length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.active')} <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>{projects.filter(p => !p.completed).length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.completed')} <Box component="span" sx={{ fontWeight: 500, color: 'success.main' }}>{projects.filter(p => p.completed).length}</Box>
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <LayoutGroup>

                <MotionBox
                    layout
                    transition={spring}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: 2
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {activeProjects.map((project) => (
                            <MotionBox
                                key={project.id}
                                layoutId={project.id}
                                layout
                                //initial={{ opacity: 0 }}
                                //animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={spring}
                                sx={{ maxWidth: 380, width: '100%', height: '100%' }}
                            >
                                <ProjectCard
                                    project={project}
                                    onClick={handleCardClick}
                                    onDelete={deleteProject}
                                    onToggle={toggleProject}
                                />
                            </MotionBox>
                        ))}
                    </AnimatePresence>
                </MotionBox>

                <MotionPaper
                    layout
                    transition={spring}
                    elevation={0}
                    className="glass-paper"
                    sx={{
                        my: 4,
                        p: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary' }}>
                            {t('projects.completed_title')}
                        </Typography>
                    </Box>
                </MotionPaper>

                <MotionBox
                    layout
                    transition={spring}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: 2
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {completedProjects.map((project) => (
                            <MotionBox
                                key={project.id}
                                layoutId={project.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                sx={{ maxWidth: 380, width: '100%', height: '100%' }}
                            >
                                <ProjectCard
                                    project={project}
                                    onClick={handleCardClick}
                                    onDelete={deleteProject}
                                    onToggle={toggleProject}
                                />
                            </MotionBox>
                        ))}
                    </AnimatePresence>
                </MotionBox>


            </LayoutGroup>

            <SpeedDial
                ariaLabel="Project actions"
                sx={{
                    position: 'fixed', bottom: 32, right: 32,
                    '& .MuiSpeedDial-fab': {
                        bgcolor: 'white',
                        color: 'black',
                        '&:hover': {
                            bgcolor: '#f5f5f5'
                        }
                    }
                }}
                icon={<SpeedDialIcon />}
                direction="up"
            >
                <SpeedDialAction
                    key="Create"
                    icon={<AddIcon />}
                    tooltipTitle={t('projects.new_project')}
                    onClick={handleAddClick}
                />
                <SpeedDialAction
                    key="Import"
                    icon={<FileUploadIcon />}
                    tooltipTitle={t('projects.import_project', 'Import Project')}
                    onClick={handleImportClick}
                />
            </SpeedDial>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
            />

            <ProjectDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                project={selectedProject}
            />
        </Box>
    );
}
