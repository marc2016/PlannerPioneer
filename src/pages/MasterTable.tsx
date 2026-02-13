import { useMemo, useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_DE } from "material-react-table/locales/de";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { Box, Paper, Typography, FormControl, Select, MenuItem, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFeatureStore } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";

interface TableRow {
    featureId: string;
    featureTitle: string;
    featureStatus: "active" | "completed";
    moduleId: string | null;
    moduleTitle: string | null;
    moduleColor: string | null;
    projectId: string | null;
    projectTitle: string | null;
    projectColor: string | null;
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

            return {
                featureId: feature.id,
                featureTitle: feature.title,
                featureStatus: feature.completed ? "completed" : "active",
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

    const columns = useMemo<MRT_ColumnDef<TableRow>[]>(
        () => [

            {
                accessorKey: "moduleTitle",
                header: t("table.columns.module"),
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
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: row.original.featureStatus === "active" ? "primary.main" : "text.disabled",
                            }}
                        />
                        {row.original.featureTitle}
                    </Box>
                ),
            },
            {
                accessorKey: "optimistic",
                header: t("table.columns.optimistic"),
                Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) || "-",
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {cell.getValue<number>()?.toFixed(1)}
                    </Box>
                ),
            },
            {
                accessorKey: "mostLikely",
                header: t("table.columns.most_likely"),
                Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) || "-",
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {cell.getValue<number>()?.toFixed(1)}
                    </Box>
                ),
            },
            {
                accessorKey: "pessimistic",
                header: t("table.columns.pessimistic"),
                Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) || "-",
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold' }}>
                        {cell.getValue<number>()?.toFixed(1)}
                    </Box>
                ),
            },
            {
                accessorKey: "expected",
                header: t("table.columns.expected"),
                Cell: ({ cell }) => (
                    <Typography variant="body2" fontWeight="bold">
                        {cell.getValue<number>()?.toFixed(1) || "-"}
                    </Typography>
                ),
                size: 100,
                aggregationFn: "sum",
                AggregatedCell: ({ cell }) => (
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {cell.getValue<number>()?.toFixed(1)}
                    </Box>
                ),
            },
        ],
        [t]
    );

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

            <MaterialReactTable
                columns={columns}
                data={data}
                enableRowSelection={false}
                enableColumnFilters
                enableGlobalFilter
                enablePagination
                enableGrouping
                localization={t('common.language') === 'Deutsch' || useTranslation().i18n.language.startsWith('de') ? MRT_Localization_DE : MRT_Localization_EN}
                initialState={{
                    density: 'compact',
                    grouping: ['moduleTitle'],
                    expanded: true,
                    pagination: { pageSize: 20, pageIndex: 0 }
                }}
                muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                    },
                }}
            />
        </Box>
    );
}
