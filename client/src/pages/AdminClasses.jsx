import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import classService from '../services/classService';
import toast, { Toaster } from 'react-hot-toast';

const AdminClasses = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        className: '',
        subject: '',
        department: '',
        year: '',
        section: '',
        location: {
            latitude: '',
            longitude: '',
            radius: 100
        }
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await classService.getFacultyClasses();
            setClasses(data.classes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingClass) {
                await classService.updateClass(editingClass._id, formData);
                toast.success('Class updated successfully');
            } else {
                await classService.createClass(formData);
                toast.success('Class created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchClasses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save class');
        }
    };

    const handleEdit = (classItem) => {
        setEditingClass(classItem);
        setFormData({
            className: classItem.className,
            subject: classItem.subject,
            department: classItem.department,
            year: classItem.year,
            section: classItem.section || '',
            location: classItem.location || { latitude: '', longitude: '', radius: 100 }
        });
        setShowModal(true);
    };

    const handleDelete = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await classService.deleteClass(classId);
                toast.success('Class deleted successfully');
                fetchClasses();
            } catch (error) {
                toast.error('Failed to delete class');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            className: '',
            subject: '',
            department: '',
            year: '',
            section: '',
            location: { latitude: '', longitude: '', radius: 100 }
        });
        setEditingClass(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading classes...</p>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Toaster position="top-right" />

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.mainTitle}>Classes Management</h1>
                    <p style={styles.subtitle}>Create and manage your classes</p>
                </div>
                <button
                    style={styles.createButton}
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <span style={styles.buttonIcon}>+</span>
                    Create New Class
                </button>
            </div>

            {/* Statistics */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📚</div>
                    <div>
                        <p style={styles.statLabel}>Total Classes</p>
                        <h3 style={styles.statValue}>{classes.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>👥</div>
                    <div>
                        <p style={styles.statLabel}>Total Students</p>
                        <h3 style={styles.statValue}>
                            {classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}
                        </h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🏛️</div>
                    <div>
                        <p style={styles.statLabel}>Departments</p>
                        <h3 style={styles.statValue}>
                            {new Set(classes.map(cls => cls.department)).size}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Classes List */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>All Classes</h2>

                {classes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>📚</span>
                        <p style={styles.emptyText}>No classes yet</p>
                        <p style={styles.emptySubtext}>Create your first class to get started</p>
                        <button
                            style={styles.emptyButton}
                            onClick={() => setShowModal(true)}
                        >
                            Create Class
                        </button>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Class Name</th>
                                    <th style={styles.th}>Subject</th>
                                    <th style={styles.th}>Department</th>
                                    <th style={styles.th}>Year</th>
                                    <th style={styles.th}>Students</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((classItem) => (
                                    <tr key={classItem._id} style={styles.tableRow}>
                                        <td style={styles.td}>
                                            <div style={styles.classNameCell}>
                                                <div style={styles.classIconCircle}>📘</div>
                                                <span style={styles.className}>{classItem.className}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{classItem.subject}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{classItem.department}</span>
                                        </td>
                                        <td style={styles.td}>Year {classItem.year}</td>
                                        <td style={styles.td}>
                                            <span style={styles.studentCount}>
                                                {classItem.students?.length || 0} students
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actionButtons}>
                                                <button
                                                    style={styles.editButton}
                                                    onClick={() => handleEdit(classItem)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    style={styles.deleteButton}
                                                    onClick={() => handleDelete(classItem._id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editingClass ? 'Edit Class' : 'Create New Class'}
                            </h2>
                            <button
                                style={styles.closeButton}
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Class Name *</label>
                                    <input
                                        type="text"
                                        name="className"
                                        value={formData.className}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="e.g., CS301"
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Subject *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="e.g., Data Structures"
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Department *</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="e.g., Computer Science"
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Year *</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Section</label>
                                    <input
                                        type="text"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="e.g., A, B, C"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Location Radius (meters)</label>
                                    <input
                                        type="number"
                                        name="location.radius"
                                        value={formData.location.radius}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                >
                                    {editingClass ? 'Update Class' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
    createButton: {
        background: '#4f46e5',
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
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    },
    buttonIcon: {
        fontSize: '20px',
        fontWeight: '700',
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
        fontSize: '40px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eff6ff',
        borderRadius: '12px',
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
        marginBottom: '24px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
    },
    emptyIcon: {
        fontSize: '64px',
        display: 'block',
        marginBottom: '16px',
    },
    emptyText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    emptySubtext: {
        fontSize: '14px',
        color: '#9ca3af',
        marginBottom: '24px',
    },
    emptyButton: {
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
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
        transition: 'background 0.2s',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#374151',
    },
    classNameCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    classIconCircle: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
    },
    className: {
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
    studentCount: {
        color: '#6b7280',
    },
    actionButtons: {
        display: 'flex',
        gap: '8px',
    },
    editButton: {
        background: '#eff6ff',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s',
    },
    deleteButton: {
        background: '#fef2f2',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        borderBottom: '1px solid #e5e7eb',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '4px 8px',
    },
    form: {
        padding: '28px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    input: {
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border 0.2s',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    submitButton: {
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default AdminClasses;