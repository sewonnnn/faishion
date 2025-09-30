import {useEffect, useState} from "react";
import axios from "axios";

const AdminCategoryPage = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    // Create new state variables for each error
    const [groupError, setGroupError] = useState("");
    const [categoryError, setCategoryError] = useState("");

    // 카테고리 그룹 + 카테고리 가져오기
    const fetchGroups = async () => {
        try {
            const response = await axios.get("/api/category/groups");
            const data = Array.isArray(response.data) ? response.data : [];
            setGroups(data);

            // 페이지 처음 로딩 시 첫 번째 그룹 선택
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

    useEffect(() => {
        fetchGroups();
    }, []);

    // 카테고리 그룹 추가
    const handleAddGroup = async () => {
        if (!newGroupName.trim()) {
            setGroupError("카테고리 그룹 이름을 입력해주세요.");
            return;
        }
        setLoading(true);
        setGroupError(""); // Clear previous error
        try {
            await axios.post("/api/category/group", { name: newGroupName });
            setNewGroupName("");
            await fetchGroups();
        } catch (err) {
            console.error(err);
            setGroupError("카테고리 그룹 추가 실패"); // Set the specific error message
        } finally {
            setLoading(false);
        }
    };

    // 카테고리 추가
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
        setCategoryError(""); // Clear previous error
        try {
            await axios.post("/api/category", {
                name: newCategoryName,
                categoryGroup: { id: selectedGroup.id },
            });
            setNewCategoryName("");
            await fetchGroups();
        } catch (err) {
            console.error(err);
            setCategoryError("카테고리 추가 실패"); // Set the specific error message
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", gap: "20px", padding: "20px", height: "500px" }}>
            {/* 좌측: 카테고리 그룹 */}
            <div style={{ flex: 1, border: "1px solid #000", display: "flex", flexDirection: "column", padding: "10px" }}>
                <h2>카테고리 그룹</h2>
                <ul style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: "5px" }}>
                    {groups.map((group) => (
                        <li
                            key={group.id}
                            style={{
                                cursor: "pointer",
                                fontWeight: selectedGroup?.id === group.id ? "bold" : "normal",
                            }}
                            onClick={() => setSelectedGroup(group)}
                        >
                            {group.name}
                        </li>
                    ))}
                </ul>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => {
                                setNewGroupName(e.target.value);
                                setGroupError(""); // Clear error on input change
                            }}
                            placeholder="카테고리 그룹 추가"
                            disabled={loading}
                        />
                        <button onClick={handleAddGroup} disabled={loading}>추가</button>
                    </div>
                    {groupError && <p style={{ color: "red", marginTop: "5px" }}>{groupError}</p>}
                </div>
            </div>

            {/* 우측: 카테고리 */}
            <div style={{ flex: 1, border: "1px solid #000", display: "flex", flexDirection: "column", padding: "10px" }}>
                <h2>카테고리</h2>
                <ul style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: "5px" }}>
                    {selectedGroup?.categories?.map((c) => (
                        <li key={c.id}>{c.name}</li>
                    ))}
                </ul>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => {
                                setNewCategoryName(e.target.value);
                                setCategoryError(""); // Clear error on input change
                            }}
                            placeholder="카테고리 추가"
                            disabled={loading || !selectedGroup}
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={loading || !selectedGroup}
                        >
                            추가
                        </button>
                    </div>
                    {categoryError && <p style={{ color: "red", marginTop: "5px" }}>{categoryError}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminCategoryPage;