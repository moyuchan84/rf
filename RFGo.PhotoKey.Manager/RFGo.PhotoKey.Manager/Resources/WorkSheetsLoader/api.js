const getBaseUrl = async () => {
    const bridge = window.chrome?.webview?.hostObjects?.bridge;
    if (!bridge) return "http://localhost:9999/api/v1"; 
    return await bridge.GetBaseUrl();
};

const apiClient = {
    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/hierarchy`);
        if (!response.ok) throw new Error('Failed to fetch hierarchy');
        const data = await response.json();
        
        // 3단계 평탄화: ProcessPlan -> BeolGroup -> Product (BeolOption 통합)
        return (data || []).map(pp => ({
            ...pp,
            beol_groups: (pp.beol_groups || []).map(bg => ({
                ...bg,
                products: (bg.beol_options || []).flatMap(bo => 
                    (bo.products || []).map(p => ({
                        ...p,
                        beol_option_name: bo.option_name,
                        beol_option_id: bo.id
                    }))
                )
            }))
        }));
    },

    async uploadPhotoKey(payload) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/upload-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async checkExistence(partid, tableName, revNo) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/exists/${partid}/${encodeURIComponent(tableName)}/${revNo}`);
        if (!response.ok) return { exists: false };
        return await response.json();
    },

    async getNextRevision(partid, tableName) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/next-rev/${partid}/${encodeURIComponent(tableName)}`);
        if (!response.ok) return { next_rev: 1 };
        return await response.json();
    }
};

window.apiClient = apiClient;
