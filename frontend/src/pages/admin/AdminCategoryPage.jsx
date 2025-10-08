import {useEffect, useState} from "react";
import axios from "axios";
import "./AdminCategoryPage.css";
import { Row, Col, Container } from "react-bootstrap";

const AdminCategoryPage = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);
    const [groupError, setGroupError] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const fetchGroups = async () => {
        try {
            const response = await axios.get("/api/category/groups");
            const data = Array.isArray(response.data) ? response.data : [];
            setGroups(data);
            if (!selectedGroup && data.length > 0) {
                setSelectedGroup(data[0]);
            } else if (selectedGroup) {
                const updated = data.find(g => g.id === selectedGroup.id);
                setSelectedGroup(updated || data[0] || null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) {
            setGroupError("카테고리 그룹 이름을 입력해주세요.");
            return;
        }
        setLoading(true);
        setGroupError("");
        try {
            await axios.post("/api/category/group", { name: newGroupName });
            setNewGroupName("");
            await fetchGroups();
        } catch {
            setGroupError("카테고리 그룹 추가 실패");
        } finally { setLoading(false); }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setCategoryError("카테고리 이름을 입력해주세요.");
            return;
        }
        if (!selectedGroup) {
            setCategoryError("그룹을 먼저 선택해주세요.");
            return;
        }
        setLoading(true);
        setCategoryError("");
        try {
            await axios.post("/api/category", {
                name: newCategoryName,
                categoryGroup: { id: selectedGroup.id },
            });
            setNewCategoryName("");
            await fetchGroups();
        } catch {
            setCategoryError("카테고리 추가 실패");
        } finally { setLoading(false); }
    };

    return (
        <Container>
        <div className="admin-category">
            {/* 좌측: 그룹 */}
            <Row>
                <Col md={6}>
                <div className="admin-panel">
                    <h2>카테고리 그룹</h2>
                    <ul className="admin-list">
                        {groups.map((group) => (
                            <li
                                key={group.id}
                                className={selectedGroup?.id === group.id ? "active" : ""}
                                onClick={() => setSelectedGroup(group)}
                            >
                                {group.name}
                            </li>
                        ))}
                    </ul>

                    <div className="input-row">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => { setNewGroupName(e.target.value); setGroupError(""); }}
                            placeholder="카테고리 그룹 추가"
                            disabled={loading}
                        />
                        <button onClick={handleAddGroup} disabled={loading}>추가</button>
                    </div>
                    {groupError && <p className="error-text">{groupError}</p>}
                </div>
                </Col>

                <Col md={6}>
                {/* 우측: 카테고리 */}
                <div className="admin-panel">
                    <h2>카테고리</h2>
                    <ul className="admin-list">
                        {selectedGroup?.categories?.map((c) => (
                            <li key={c.id}>{c.name}</li>
                        ))}
                    </ul>

                    <div className="input-row">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => { setNewCategoryName(e.target.value); setCategoryError(""); }}
                            placeholder="카테고리 추가"
                            disabled={loading || !selectedGroup}
                        />
                        <button onClick={handleAddCategory} disabled={loading || !selectedGroup}>
                            추가
                        </button>
                    </div>
                    {categoryError && <p className="error-text">{categoryError}</p>}
                </div>
                </Col>
            </Row>
        </div>
        </Container>
    );
};

export default AdminCategoryPage;
