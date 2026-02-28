import { useMemo, useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_DE } from "material-react-table/locales/de";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { Box, Paper, Typography, FormControl, Select, MenuItem, Divider, Chip, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFeatureStore } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import { Edit, InfoOutlined } from "@mui/icons-material"; // Import Edit icon
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
    status: string;
    optimistic: number | null;
    mostLikely: number | null;
    pessimistic: number | null;
    expected: number | null;
    standardDeviation: number | null;
    variance: number | null;
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
                featureColor: feature.color || null,
                status: status,
                moduleId: module?.id || null,
                moduleTitle: module?.title || null,
                moduleColor: module?.color || null,
                projectId: project?.id || null,
                projectTitle: project?.title || null,
                projectColor: project?.color || null,
                optimistic: feature.pert_optimistic ?? null,
                mostLikely: feature.pert_most_likely ?? null,
                pessimistic: feature.pert_pessimistic ?? null,
                expected: feature.expected_duration ?? null,
                standardDeviation: feature.standard_deviation ?? null,
                variance: feature.variance ?? null,
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
                    return (typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(1) : "-";
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
                    return (typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(1) : "-";
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
                    return (typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(1) : "-";
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
                            {(typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(1) : "-"}
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
            {
                accessorKey: "variance",
                header: t("table.columns.variance"),
                enableEditing: false,
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(2) : "-";
                },
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {Number(cell.getValue())?.toFixed(2)}
                    </Box>
                ),
                Footer: ({ table }) => {
                    const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.variance) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{total.toFixed(2)}</Box>;
                },
            },
            {
                accessorKey: "standardDeviation",
                header: t("table.columns.standard_deviation"),
                enableEditing: false,
                Cell: ({ cell }) => {
                    const val = cell.getValue<number | string | null>();
                    return (typeof val === 'number' || (typeof val === 'string' && val !== '')) ? Number(val).toFixed(2) : "-";
                },
                size: 100,
                AggregatedCell: ({ row }) => {
                    const leafRows = row.getLeafRows();
                    const sumVariance = leafRows.reduce((sum, r) => sum + (Number(r.original.variance) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{Math.sqrt(sumVariance).toFixed(2)}</Box>;
                },
                Footer: ({ table }) => {
                    const totalVariance = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (Number(row.original.variance) || 0), 0);
                    return <Box sx={{ fontWeight: 'bold' }}>{Math.sqrt(totalVariance).toFixed(2)}</Box>;
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

    const renderProjectSelect = () => (
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
    );

    return (
        <Box>
            <Paper
                elevation={0}
                className="glass-paper"
                sx={{
                    mb: 4,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeft: `6px solid ${selectedProject?.color || '#FFE0B2'}`,
                    gap: 2,
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' }
                }}
            >
                {!selectedProject ? (
                    <>
                        <Typography variant="h4" sx={{ fontWeight: 100, color: "text.secondary", whiteSpace: "nowrap" }}>
                            {t("table.title")}
                        </Typography>
                        {renderProjectSelect()}
                    </>
                ) : (
                    (() => {
                        const baseDuration = selectedProject.totalDuration || 0;
                        const factors = selectedProject.factors || [];
                        const factorDuration = factors.reduce((acc, factor) => acc + (baseDuration * (factor.value / 100)), 0);
                        const totalWithFactors = baseDuration + factorDuration;

                        // Calculate variance and std dev for project based on current data
                        const projectVariance = data.reduce((sum, row) => sum + (Number(row.variance) || 0), 0);
                        const projectStdDev = Math.sqrt(projectVariance);

                        return (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 100, color: "text.secondary", whiteSpace: "nowrap" }}>
                                        {selectedProject.title}
                                    </Typography>
                                    <IconButton size="small" onClick={() => setIsDrawerOpen(true)} sx={{ flexShrink: 0 }}>
                                        <Edit fontSize="small" />
                                    </IconButton>

                                    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: 'text.disabled' }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' }}>
                                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                            {t('table.total', 'Total')}: <strong>{totalWithFactors.toFixed(1)}h</strong>
                                        </Typography>

                                        <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'text.disabled' }} />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                                {t('table.project_variance', 'Projektvarianz:')} <strong>{projectVariance.toFixed(2)}</strong>
                                            </Typography>
                                            <Tooltip
                                                title={t('table.project_variance_tooltip', 'Die Varianz eines Projekts ergibt sich aus der Summe der Varianzen aller zugehörigen Items.')}
                                                enterTouchDelay={0}
                                                leaveTouchDelay={2000}
                                            >
                                                <IconButton size="small" sx={{ p: 0.5 }}>
                                                    <InfoOutlined fontSize="small" color="action" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'text.disabled' }} />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                                {t('table.project_std_dev', 'Projekt-Standardabweichung:')} <strong>{projectStdDev.toFixed(2)}</strong>
                                            </Typography>
                                            <Tooltip
                                                title={t('table.project_std_dev_tooltip', 'Die Standardabweichung des Projekts ist die Wurzel aus der Projektvarianz. Sie gibt an, wie stark die tatsächliche Projektdauer voraussichtlich streuen wird.')}
                                                enterTouchDelay={0}
                                                leaveTouchDelay={2000}
                                            >
                                                <IconButton size="small" sx={{ p: 0.5 }}>
                                                    <InfoOutlined fontSize="small" color="action" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'text.disabled' }} />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                                {t('table.sigma_level', 'Sigma-Level (99.7%):')} <strong>{(totalWithFactors + 3 * projectStdDev).toFixed(1)}h</strong>
                                            </Typography>
                                            <Tooltip
                                                title={
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>{t('table.sigma_tooltip_title', 'Konfidenzintervalle auf Basis der Standardabweichung (Erwartungswert + n * SD):')}</Typography>
                                                        <Box component="ul" sx={{ m: 0, pl: 2, typography: 'body2' }}>
                                                            <li><strong>{t('table.sigma_1', '1-Sigma (68.3%):')}</strong> {(totalWithFactors + projectStdDev).toFixed(1)}h</li>
                                                            <li><strong>{t('table.sigma_2', '2-Sigma (95.5%):')}</strong> {(totalWithFactors + 2 * projectStdDev).toFixed(1)}h</li>
                                                            <li><strong>{t('table.sigma_3', '3-Sigma (99.7%):')}</strong> {(totalWithFactors + 3 * projectStdDev).toFixed(1)}h</li>
                                                        </Box>
                                                    </Box>
                                                }
                                                enterTouchDelay={0}
                                                leaveTouchDelay={2000}
                                            >
                                                <IconButton size="small" sx={{ p: 0.5 }}>
                                                    <InfoOutlined fontSize="small" color="action" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        {factors.length > 0 && (
                                            <>
                                                <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'text.disabled' }} />
                                                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                            </>
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ flexShrink: 0 }}>
                                    {renderProjectSelect()}
                                </Box>
                            </>
                        );
                    })()
                )}
            </Paper>


            <MaterialReactTable table={table} />

            <ProjectDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                project={selectedProject}
            />

        </Box>
    );
}
