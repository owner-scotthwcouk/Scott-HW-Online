import React, { useState, useEffect } from 'react';
import './Admin.css';
import { saveAbout, saveContact, saveMissionUpdate, saveProject } from './portfolioData';

function Admin({ onLogout, onDataChange }) {
    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('projects');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/data');
            const jsonData = await response.json();
            if (!response.ok) throw new Error(jsonData.error || 'Failed to load content');
            setData(jsonData);
        } catch (error) {
            setStatusMessage(error.message);
        }
    };

    const persist = async (next) => {
        if (saving) return false;
        setSaving(true);
        try {
            const response = await fetch('/api/data', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(next),
            });
            const saved = await response.json();
            if (!response.ok) throw new Error(saved.error || 'Save failed');
            setData(saved);
            onDataChange(saved);
            setStatusMessage('Saved to database.');
            return true;
        } catch (error) { setStatusMessage(error.message); return false; }
        finally { setSaving(false); }
    };
    const handleSave = () => persist(data);

    const openNewModal = () => {
        setStatusMessage('');
        if (activeTab === 'projects') {
            setEditingItem({ stardate: '', title: '', desc: '', url: '' });
        } else if (activeTab === 'mission_update') {
            setEditingItem({ stardate: '', update_title: '', update_desc: '' });
        } else if (activeTab === 'about') {
            setEditingItem({ ...data.about });
        } else if (activeTab === 'contact') {
            setEditingItem({ ...data.contact });
        }
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setStatusMessage('');
        setEditingItem({ ...item });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingItem(null);
    };

    const handleModalSave = async () => {
        let next = data;
        if (activeTab === 'projects') next = saveProject(data, editingItem);
        else if (activeTab === 'mission_update') next = saveMissionUpdate(data, editingItem);
        else if (activeTab === 'about') next = saveAbout(data, editingItem);
        else if (activeTab === 'contact') next = saveContact(data, editingItem);
        if (await persist(next)) closeModal();
    };

    const handleCheckboxChange = (index) => {
        if (selectedItems.includes(index)) {
            setSelectedItems(selectedItems.filter(i => i !== index));
        } else {
            setSelectedItems([...selectedItems, index]);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedItems.length) return;
        const next = { ...data, [activeTab]: data[activeTab].filter((_, index) => !selectedItems.includes(index)) };
        if (await persist(next)) setSelectedItems([]);
    };

    if (!data) return <div role="status">{statusMessage || 'LOADING DATA...'} <button onClick={fetchData}>Retry</button><button onClick={onLogout}>Exit</button></div>;

    return (
        <div className="admin-container">
            <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {saving && <p role="status">Saving...</p>}
            <h1>ADMIN CONTROL PANEL</h1>

            <div className="admin-header">
                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('projects'); setSelectedItems([]); }}
                    >
                        Projects
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'mission_update' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('mission_update'); setSelectedItems([]); }}
                    >
                        Mission Updates
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('about'); setSelectedItems([]); }}
                    >
                        About
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('contact'); setSelectedItems([]); }}
                    >
                        Contact
                    </button>
                </div>

                <div className="admin-actions">
                    <button className="btn btn-primary" onClick={openNewModal}>
                        + NEW {activeTab === 'projects' ? 'PROJECT' : activeTab === 'mission_update' ? 'MISSION' : 'ENTRY'}
                    </button>
                    {(activeTab === 'projects' || activeTab === 'mission_update') && selectedItems.length > 0 && (
                        <button className="btn btn-danger" onClick={handleDeleteSelected}>
                            DELETE SELECTED ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-section">
                {activeTab === 'projects' && (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-col">SELECT</th>
                                    <th>STARDATE</th>
                                    <th>TITLE</th>
                                    <th>DESCRIPTION</th>
                                    <th>URL</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.projects.map((project, index) => (
                                    <tr key={index}>
                                        <td className="checkbox-col">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(index)}
                                                onChange={() => handleCheckboxChange(index)}
                                            />
                                        </td>
                                        <td>{project.stardate}</td>
                                        <td>{project.title}</td>
                                        <td className="description-col">{project.desc}</td>
                                        <td><a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a></td>
                                        <td>
                                            <button className="btn-small btn-edit" onClick={() => openEditModal(project)}>
                                                EDIT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'mission_update' && (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-col">SELECT</th>
                                    <th>STARDATE</th>
                                    <th>TITLE</th>
                                    <th>DESCRIPTION</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.mission_update.map((mission, index) => (
                                    <tr key={index}>
                                        <td className="checkbox-col">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(index)}
                                                onChange={() => handleCheckboxChange(index)}
                                            />
                                        </td>
                                        <td>{mission.stardate}</td>
                                        <td>{mission.update_title}</td>
                                        <td className="description-col">{mission.update_desc}</td>
                                        <td>
                                            <button className="btn-small btn-edit" onClick={() => openEditModal(mission)}>
                                                EDIT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="data-view">
                        <div className="view-item">
                            <label>TITLE:</label>
                            <p>{data.about.title}</p>
                        </div>
                        <div className="view-item">
                            <label>IMAGE:</label>
                            <p>{data.about.image}</p>
                        </div>
                        <div className="view-item">
                            <label>BIO:</label>
                            <p>{data.about.bio}</p>
                        </div>
                        <div className="view-item">
                            <label>INSPIRATION:</label>
                            <p>{data.about.inspiration}</p>
                        </div>
                        <div className="view-item">
                            <label>CLOSING:</label>
                            <p>{data.about.closing}</p>
                        </div>
                        <button className="btn btn-primary" onClick={openNewModal}>
                            EDIT ABOUT
                        </button>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="data-view">
                        <div className="view-item">
                            <label>EMAIL:</label>
                            <p>{data.contact.email}</p>
                        </div>
                        <div className="view-item">
                            <label>GITHUB:</label>
                            <p>{data.contact.github}</p>
                        </div>
                        <div className="view-item">
                            <label>LINKEDIN:</label>
                            <p>{data.contact.linkedin}</p>
                        </div>
                        <button className="btn btn-primary" onClick={openNewModal}>
                            EDIT CONTACT
                        </button>
                    </div>
                )}
            </div>

            <div className="admin-footer">
                <button className="btn btn-primary" onClick={handleSave}>
                    SAVE DATA
                </button>
                <button className="btn btn-danger" onClick={onLogout}>
                    LOGOUT
                </button>
                {statusMessage && <div role="status" className="status-message">{statusMessage}</div>}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            {activeTab === 'projects' && 'PROJECT ENTRY'}
                            {activeTab === 'mission_update' && 'MISSION UPDATE ENTRY'}
                            {activeTab === 'about' && 'EDIT ABOUT'}
                            {activeTab === 'contact' && 'EDIT CONTACT'}
                        </h2>

                        {statusMessage && <p role="alert">{statusMessage}</p>}
                        <div className="modal-form">
                            {activeTab === 'projects' && (
                                <>
                                    <div className="form-group">
                                        <label>STARDATE</label>
                                        <input
                                            type="text"
                                            value={editingItem.stardate || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, stardate: e.target.value })}
                                            placeholder="e.g., 2024.11.30"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>TITLE</label>
                                        <input
                                            type="text"
                                            value={editingItem.title || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>DESCRIPTION</label>
                                        <textarea
                                            value={editingItem.desc || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                                            placeholder="Enter description"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>URL</label>
                                        <input
                                            type="text"
                                            value={editingItem.url || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'mission_update' && (
                                <>
                                    <div className="form-group">
                                        <label>STARDATE</label>
                                        <input
                                            type="text"
                                            value={editingItem.stardate || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, stardate: e.target.value })}
                                            placeholder="e.g., 2024.11.30"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>TITLE</label>
                                        <input
                                            type="text"
                                            value={editingItem.update_title || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, update_title: e.target.value })}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>DESCRIPTION</label>
                                        <textarea
                                            value={editingItem.update_desc || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, update_desc: e.target.value })}
                                            placeholder="Enter description"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'about' && (
                                <>
                                    <div className="form-group">
                                        <label>TITLE</label>
                                        <input
                                            type="text"
                                            value={editingItem.title || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>IMAGE</label>
                                        <input
                                            type="text"
                                            value={editingItem.image || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                                            placeholder="Image filename (e.g., profile.webp)"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>BIO</label>
                                        <textarea
                                            value={editingItem.bio || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>INSPIRATION</label>
                                        <textarea
                                            value={editingItem.inspiration || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, inspiration: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CLOSING</label>
                                        <textarea
                                            value={editingItem.closing || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, closing: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'contact' && (
                                <>
                                    <div className="form-group">
                                        <label>EMAIL</label>
                                        <input
                                            type="text"
                                            value={editingItem.email || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>GITHUB</label>
                                        <input
                                            type="text"
                                            value={editingItem.github || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, github: e.target.value })}
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>LINKEDIN</label>
                                        <input
                                            type="text"
                                            value={editingItem.linkedin || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleModalSave}>
                                SAVE
                            </button>
                            <button className="btn btn-secondary" onClick={closeModal}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </fieldset>
        </div>
    );
}

export default Admin;
