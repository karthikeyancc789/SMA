import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const AdminReports = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [stats, setStats] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchAttendanceData();
        }
    }, [selectedClass, dateRange]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getFacultyClasses();
            setClasses(data.classes || []);
            if (data.classes && data.classes.length > 0) {
                setSelectedClass(data.classes[0]._id);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceData = async () => {
        try {
            const data = await attendanceService.getClassAttendance(selectedClass, dateRange);
            setAttendanceData(data.attendance || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load attendance data');
        }
    };

    const handleExport = () => {
        // Export to CSV logic
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report exported successfully');
    };

    const generateCSV = () => {
        const headers = ['Student Name', 'Roll Number', 'Total Classes', 'Present', 'Absent', 'Percentage'];
        const rows = attendanceData.map(record => [
            record.student?.name || 'N/A',
            record.student?.rollNumber || 'N/A',
            record.totalClasses || 0,
            record.present || 0,
            record.absent || 0,
            `${record.percentage || 0}%`
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const pieData = stats ? [
        { name: 'Present', value: stats.totalPresent, color: '#10b981' },
        { name: 'Absent', value: stats.totalAbsent, color: '#ef4444' }
    ] : [];

    const chartData = attendanceData.slice(0, 10).map(record => ({
        name: record.student?.name?.split(' ')[0] || 'Unknown',
        percentage: record.percentage || 0
    }));

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading reports...</p>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Toaster position="top-right" />

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.mainTitle}>Attendance Reports</h1>
                    <p style={styles.subtitle}>View and analyze attendance data</p>
                </div>
                <button
                    style={styles.exportButton}
                    onClick={handleExport}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <span style={styles.buttonIcon}>📥</span>
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div style={styles.filtersCard}>
                <div style={styles.filterGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={styles.filterSelect}
                        >
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.className} - {cls.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            style={styles.filterInput}
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            style={styles.filterInput}
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#eff6ff' }}>
                        <span style={{ fontSize: '28px' }}>👥</span>
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Students</p>
                        <h3 style={styles.statValue}>{stats?.totalStudents || 0}</h3>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>
                        <span style={{ fontSize: '28px' }}>✓</span>
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Present</p>
                        <h3 style={styles.statValue}>{stats?.totalPresent || 0}</h3>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#fef2f2' }}>
                        <span style={{ fontSize: '28px' }}>✗</span>
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Absent</p>
                        <h3 style={styles.statValue}>{stats?.totalAbsent || 0}</h3>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#fffbeb' }}>
                        <span style={{ fontSize: '28px' }}>📊</span>
                    </div>
                    <div>
                        <p style={styles.statLabel}>Average Attendance</p>
                        <h3 style={styles.statValue}>{stats?.averagePercentage?.toFixed(1) || 0}%</h3>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div style={styles.chartsGrid}>
                {/* Bar Chart */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Top 10 Students by Attendance</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="percentage" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={styles.emptyChart}>
                            <span style={styles.emptyIcon}>📊</span>
                            <p style={styles.emptyText}>No data available</p>
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Overall Attendance</h2>
                    {pieData.length > 0 && stats ? (
                        <div style={styles.pieChartContainer}>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={styles.legendContainer}>
                                {pieData.map((entry, index) => (
                                    <div key={index} style={styles.legendItem}>
                                        <div style={{ ...styles.legendDot, background: entry.color }}></div>
                                        <span style={styles.legendText}>{entry.name}: {entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyChart}>
                            <span style={styles.emptyIcon}>📊</span>
                            <p style={styles.emptyText}>No data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Table */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Detailed Attendance Records</h2>

                {attendanceData.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyStateIcon}>📋</span>
                        <p style={styles.emptyStateText}>No attendance records found</p>
                        <p style={styles.emptyStateSubtext}>Select a class to view attendance data</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Student Name</th>
                                    <th style={styles.th}>Roll Number</th>
                                    <th style={styles.th}>Department</th>
                                    <th style={styles.th}>Total Classes</th>
                                    <th style={styles.th}>Present</th>
                                    <th style={styles.th}>Absent</th>
                                    <th style={styles.th}>Percentage</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((record, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                        <td style={styles.td}>
                                            <div style={styles.studentCell}>
                                                <div style={styles.avatar}>
                                                    {record.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <span style={styles.studentName}>
                                                    {record.student?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{record.student?.rollNumber || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>
                                                {record.student?.department || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{record.totalClasses || 0}</td>
                                        <td style={styles.td}>
                                            <span style={styles.presentBadge}>{record.present || 0}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.absentBadge}>{record.absent || 0}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.percentage}>{record.percentage?.toFixed(1) || 0}%</span>
                                        </td>
                                        <td style={styles.td}>
                                            {record.percentage >= 75 ? (
                                                <span style={styles.statusGood}>Good</span>
                                            ) : record.percentage >= 50 ? (
                                                <span style={styles.statusWarning}>Warning</span>
                                            ) : (
                                                <span style={styles.statusPoor}>Poor</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '40px 20px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f9fafb',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '20px',
        color: '#6b7280',
        fontSize: '16px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
    },
    mainTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6b7280',
    },
    exportButton: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    buttonIcon: {
        fontSize: '20px',
    },
    filtersCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    filterLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    filterSelect: {
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
    },
    filterInput: {
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '4px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#111827',
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '20px',
    },
    emptyChart: {
        textAlign: 'center',
        padding: '60px 20px',
    },
    emptyIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '12px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#9ca3af',
    },
    pieChartContainer: {
        textAlign: 'center',
    },
    legendContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '16px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    legendDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
    },
    legendText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
    },
    emptyStateIcon: {
        fontSize: '64px',
        display: 'block',
        marginBottom: '16px',
    },
    emptyStateText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    emptyStateSubtext: {
        fontSize: '14px',
        color: '#9ca3af',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        borderBottom: '2px solid #e5e7eb',
    },
    th: {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280',
    },
    tableRow: {
        borderBottom: '1px solid #f3f4f6',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#374151',
    },
    studentCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#4f46e5',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
    },
    studentName: {
        fontWeight: '600',
        color: '#111827',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '6px',
        background: '#eff6ff',
        color: '#3b82f6',
        fontSize: '12px',
        fontWeight: '600',
    },
    presentBadge: {
        padding: '4px 12px',
        borderRadius: '6px',
        background: '#f0fdf4',
        color: '#16a34a',
        fontSize: '12px',
        fontWeight: '600',
    },
    absentBadge: {
        padding: '4px 12px',
        borderRadius: '6px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: '12px',
        fontWeight: '600',
    },
    percentage: {
        fontWeight: '700',
        color: '#111827',
    },
    statusGood: {
        padding: '6px 12px',
        borderRadius: '20px',
        background: '#10b981',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
    statusWarning: {
        padding: '6px 12px',
        borderRadius: '20px',
        background: '#f59e0b',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
    statusPoor: {
        padding: '6px 12px',
        borderRadius: '20px',
        background: '#ef4444',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
    },
};

export default AdminReports;