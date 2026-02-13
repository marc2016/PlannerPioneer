
import { DashboardStats } from "../components/DashboardStats";
import { RecentProjects } from "../components/RecentProjects";
import { RecentModules } from "../components/RecentModules";
import "../App.css";
import { Paper } from "@mui/material";

function Dashboard() {


    return (
        <main className="container dashboard-container">
            <Paper elevation={0} className="glass-panel">
                <DashboardStats />
            </Paper>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <Paper elevation={0} className="glass-panel" style={{ margin: 0 }}>
                    <RecentProjects />
                </Paper>

                <Paper elevation={0} className="glass-panel" style={{ margin: 0 }}>
                    <RecentModules />
                </Paper>
            </div>
        </main>
    );
}

export default Dashboard;
