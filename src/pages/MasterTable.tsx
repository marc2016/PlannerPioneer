import { useMemo, useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_DE } from "material-react-table/locales/de";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { Box, Paper, Typography, FormControl, Select, MenuItem, Divider, Chip, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFeatureStore } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import { Edit } from "@mui/icons-material"; // Import Edit icon
import ProjectDrawer from "../components/ProjectDrawer"; // Import ProjectDrawer


interface TableRow {
    featureId: string;
    featureTitle: string;
    featureColor: string | null;
    moduleId: string | null;
    moduleTitle: string | null;
    moduleColor: string | null;
    projectId: string | null;
    projectTitle: string | null;
    projectColor: string | null;
    status: "active" | "completed";
    optimistic: number | null;
    mostLikely: number | null;
    pessimistic: number | null;
    expected: number | null;
}

export default function MasterTable() {
    const { t } = useTranslation();
    const { features, init: initFeatures } = useFeatureStore();
    const { modules, init: initModules } = useModuleStore();
    const { projects, init: initProjects } = useProjectStore();

    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const selectedProject = useMemo(() => projects.find(p => p.id === projectFilter), [projects, projectFilter]);


    useEffect(() => {
        initFeatures();
        initModules();
        initProjects();
    }, [initFeatures, initModules, initProjects]);

    const data = useMemo<TableRow[]>(() => {
        let filteredFeatures = features;

        if (projectFilter !== "all") {
            filteredFeatures = features.filter((feature) => {
                const module = modules.find((m) => m.id === feature.module_id);
                // If filter is unassigned, we want features with modules that have NO project, OR features with NO module?
                // Based on Features.tsx logic:
                if (projectFilter === "unassigned") {
                    // logic from Features.tsx:
                    // if (!f.module_id) -> depends on if we consider feature without module as unassigned project. Features.tsx says yes if unassigned is keeping it.
                    // But here we are looking at features.
                    if (!module) return true; // Feature has no module -> effectively no project
                    if (!module.project_id) return true; // Module has no project
                    return false;
                } else {
                    if (!module) return false;
                    return module.project_id === projectFilter;
                }
            });
        }

        return filteredFeatures.map((feature) => {
            const module = modules.find((m) => m.id === feature.module_id);
            const project = module?.project_id
                ? projects.find((p) => p.id === module.project_id)
                : null;
            let status = "";
            if (feature) {
                status = feature.completed ? t("common.completed") : t("common.not_completed");
            } else if (module) {
                status = module.completed ? t("common.completed") : t("common.not_completed");
            } else if (project) {
                status = project.completed ? t("common.completed") : t("common.not_completed");
            }
            return {
                featureId: feature.id,
                featureTitle: feature.title,
                status: status,
                moduleId: module?.id || null,
                moduleTitle: module?.title || null,
                moduleColor: module?.color || null,
                projectId: project?.id || null,
                projectTitle: project?.title || null,
                projectColor: project?.color || null,
                optimistic: feature.pert_optimistic || null,
                mostLikely: feature.pert_most_likely || null,
                pessimistic: feature.pert_pessimistic || null,
                expected: feature.expected_duration || null,
            };
        });
    }, [features, modules, projects, projectFilter]);

    const { updateFeature } = useFeatureStore();

    const handleSaveCell = async (cell: any, value: any) => {
        const { row, column } = cell;
        const featureId = row.original.featureId;

        if (!featureId) return;

        const updateData: any = {};

        if (column.id === 'featureTitle') {
            updateData.title = value;
        } else if (['optimistic', 'mostLikely', 'pessimistic'].includes(column.id)) {
            // Map column id to database field name
            const fieldMap: Record<string, string> = {
                'optimistic': 'pert_optimistic',
                'mostLikely': 'pert_most_likely',
                'pessimistic': 'pert_pessimistic'
            };
            // Ensure value is a number or null
            const numValue = value === '' ? null : Number(value);
            if (!isNaN(numValue as number) || numValue === null) {
                updateData[fieldMap[column.id]] = numValue;
            }
        }

        if (Object.keys(updateData).length > 0) {
            await updateFeature(featureId, updateData);
        }
    };

    const columns = useMemo<MRT_ColumnDef<TableRow>[]>(
        () => [

            {
                accessorKey: "moduleTitle",
                header: t("table.columns.module"),
                enableHiding: false,
                enableEditing: false,
                Cell: ({ row }) =>
                    row.original.moduleTitle ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: row.original.moduleColor || "grey.500",
                                }}
                            />
                            {row.original.moduleTitle}
                        </Box>
                    ) : (
                        "-"
                    ),
            },
            {
                accessorKey: "featureTitle",
                header: t("table.columns.feature"),
                enableHiding: false,
                enableEditing: true,
                muiEditTextFieldProps: ({ cell }) => ({
                    onBlur: (event) => {
                        handleSaveCell(cell, event.target.value);
                    },
                }),
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: row.original.moduleColor || row.original.featureColor || "grey.500",
                            }}
                        />
                        {row.original.featureTitle}
                    </Box>
                ),
                Footer: () => <Box sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('table.total', 'Total')}:</Box>,
            },
            {
                accessorKey: "status",
                header: t("table.columns.status"),
                enableHiding: false,
                enableEditing: false,
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                        {row.original.status}
                    </Box>
                ),
                Footer: () => <Box sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('table.total', 'Total')}:</Box>,
            },
            {
                accessorKey: "optimistic",
                header: t("table.columns.optimistic"),
                enableEditing: true,
                muiEditTextFieldProps: ({ cell }) => ({
                    type: 'number',
                    onBlur: (event) => {
                        handleSaveCell(cell, event.target.value);
                    },
                }),
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (val !== null && val !== undefined && val !== '') ? Number(val).toFixed(1) : "-";
                },
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {Number(cell.getValue())?.toFixed(1)}
                    </Box>
                ),
                Footer: ({ table }) => {
                    const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.optimistic) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{total.toFixed(1)}</Box>;
                },
            },
            {
                accessorKey: "mostLikely",
                header: t("table.columns.most_likely"),
                enableEditing: true,
                muiEditTextFieldProps: ({ cell }) => ({
                    type: 'number',
                    onBlur: (event) => {
                        handleSaveCell(cell, event.target.value);
                    },
                }),
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (val !== null && val !== undefined && val !== '') ? Number(val).toFixed(1) : "-";
                },
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {Number(cell.getValue())?.toFixed(1)}
                    </Box>
                ),
                Footer: ({ table }) => {
                    const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.mostLikely) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{total.toFixed(1)}</Box>;
                },
            },
            {
                accessorKey: "pessimistic",
                header: t("table.columns.pessimistic"),
                enableEditing: true,
                muiEditTextFieldProps: ({ cell }) => ({
                    type: 'number',
                    onBlur: (event) => {
                        handleSaveCell(cell, event.target.value);
                    },
                }),
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (val !== null && val !== undefined && val !== '') ? Number(val).toFixed(1) : "-";
                },
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {Number(cell.getValue())?.toFixed(1)}
                    </Box>
                ),
                Footer: ({ table }) => {
                    const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.pessimistic) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{total.toFixed(1)}</Box>;
                },
            },
            {
                accessorKey: "expected",
                header: t("table.columns.expected"),
                enableEditing: false,
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (
                        <Typography variant="body2" fontWeight="bold">
                            {(val !== null && val !== undefined && val !== '') ? Number(val).toFixed(1) : "-"}
                        </Typography>
                    );
                },
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {Number(cell.getValue())?.toFixed(1)}
                    </Box>
                ),
                Footer: ({ table }) => {
                    const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.expected) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>{total.toFixed(1)}</Box>;
                },
            },
        ],
        [t]
    );


    const table = useMaterialReactTable({
        columns,
        data,
        enableRowSelection: false,
        enableColumnFilters: true,
        enableGlobalFilter: true,
        enablePagination: true,
        enableGrouping: true,
        enableEditing: true,
        editDisplayMode: 'cell',
        localization: t('common.language') === 'Deutsch' || useTranslation().i18n.language.startsWith('de') ? MRT_Localization_DE : MRT_Localization_EN,
        enableTableFooter: true,
        initialState: {
            density: 'compact',
            grouping: ['moduleTitle'],
            expanded: true,
            pagination: { pageSize: 20, pageIndex: 0 }
        },
        muiTablePaperProps: ({ table }) => {
            const isFullScreen = table.getState().isFullScreen;
            return {
                elevation: 0,
                sx: {
                    borderRadius: isFullScreen ? 0 : 4,
                    border: isFullScreen ? "none" : "1px solid",
                    borderColor: "divider",
                },
                style: {
                    paddingTop: isFullScreen ? "50px" : "0",
                    paddingLeft: isFullScreen ? "80px" : "0",
                    paddingRight: isFullScreen ? "20px" : "0",
                    paddingBottom: isFullScreen ? "20px" : "0",
                }
            };
        }
    });

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.30)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 100, color: "text.secondary" }}>
                    {t("table.title")}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
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
                        <MenuItem value="all">{t('filters.all_projects', "Alle Projekte")}</MenuItem>
                        <MenuItem value="unassigned">{t('filters.no_project', "Kein Projekt")}</MenuItem>
                        <Divider />
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: project.color }} />
                                    {project.title}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {selectedProject && (
                (() => {
                    const baseDuration = selectedProject.totalDuration || 0;
                    const factors = selectedProject.factors || [];
                    const factorDuration = factors.reduce((acc, factor) => acc + (baseDuration * (factor.value / 100)), 0);
                    const totalWithFactors = baseDuration + factorDuration;

                    return (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 4,
                                p: 3,
                                backgroundColor: "rgba(255, 255, 255, 0.30)",
                                backdropFilter: "blur(4px)",
                                borderRadius: 4,
                                borderLeft: `6px solid ${selectedProject.color || '#FFE0B2'}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                                            {selectedProject.title}
                                        </Typography>
                                        <IconButton size="small" onClick={() => setIsDrawerOpen(true)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedProject.description || t('projects.no_description')}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        {t('table.total', 'Total Duration')}
                                    </Typography>
                                    <Typography variant="h6">
                                        {totalWithFactors.toFixed(1)}h
                                    </Typography>
                                    {factors.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                            ({baseDuration.toFixed(1)}h + {factorDuration.toFixed(1)}h factors)
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {factors.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        {t('projects.factors.title', 'Factors')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {factors.map(f => (
                                            <Chip
                                                key={f.id}
                                                label={`${f.label}: ${f.value > 0 ? '+' : ''}${f.value}%`}
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    );
                })()
            )}


            <MaterialReactTable table={table} />

            <ProjectDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                project={selectedProject}
            />

        </Box>
    );
}
