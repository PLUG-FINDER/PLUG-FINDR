import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { UserInfo } from '../../api/auth';
import Loader from '../../components/Loader';
import './AdminPages.css';

interface Student extends UserInfo {
  isActive: boolean;
  createdAt: string;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freezing, setFreezing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await adminAPI.getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeToggle = async (studentId: string, currentFreezeStatus: boolean) => {
    try {
      setFreezing(studentId);
      await adminAPI.toggleStudentFreeze(studentId);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle freeze status.');
    } finally {
      setFreezing(null);
    }
  };

  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      setDeleting(studentToDelete);
      await adminAPI.deleteStudent(studentToDelete);
      setStudentToDelete(null);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setStudentToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">All Students</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleDeleteCancel}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete this student? This action cannot be undone. All associated reviews, feedback, and profile data will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting === studentToDelete}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting === studentToDelete ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  opacity: deleting === studentToDelete ? 0.6 : 1
                }}
              >
                {deleting === studentToDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <div className="no-results">No students found.</div>
      ) : (
        <div className="vendors-list">
          {students.map((student) => (
            <div key={student._id} className="vendor-approval-card" style={{ cursor: 'default' }}>
              <div className="vendor-info" style={{ flex: 1 }}>
                <h3>{student.name || 'No name'}</h3>
                <p><strong>Email:</strong> {student.email}</p>
                {student.whatsappNumber && (
                  <p><strong>WhatsApp:</strong> {student.whatsappNumber}</p>
                )}
                <p><strong>Joined:</strong> {formatDate(student.createdAt)}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span 
                    className={`status-${student.isActive ? 'approved' : 'rejected'}`} 
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      backgroundColor: student.isActive ? '#10B981' : '#EF4444',
                      color: 'white'
                    }}
                  >
                    {student.isActive ? 'ACTIVE' : 'FROZEN'}
                  </span>
                </div>
              </div>
              <div className="vendor-actions" style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <button
                  onClick={() => handleFreezeToggle(student._id, student.isActive)}
                  disabled={freezing === student._id}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: student.isActive ? '#60A5FA' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: freezing === student._id ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    opacity: freezing === student._id ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: freezing === student._id ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.25)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (freezing !== student._id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
                      if (student.isActive) {
                        e.currentTarget.style.backgroundColor = '#3B82F6';
                      } else {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (freezing !== student._id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
                      e.currentTarget.style.backgroundColor = student.isActive ? '#60A5FA' : '#3B82F6';
                    }
                  }}
                  title={student.isActive ? 'Freeze student (disable account)' : 'Unfreeze student (enable account)'}
                >
                  {freezing === student._id ? '...' : student.isActive ? '❄️ Freeze' : '✅ Unfreeze'}
                </button>
                <button
                  onClick={() => handleDeleteClick(student._id)}
                  disabled={deleting === student._id}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: deleting === student._id ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    opacity: deleting === student._id ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: deleting === student._id ? 'none' : '0 2px 8px rgba(220, 38, 38, 0.25)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (deleting !== student._id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
                      e.currentTarget.style.backgroundColor = '#B91C1C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deleting !== student._id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.25)';
                      e.currentTarget.style.backgroundColor = '#DC2626';
                    }
                  }}
                  title="Delete student permanently"
                >
                  {deleting === student._id ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentList;

