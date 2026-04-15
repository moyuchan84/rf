const getBaseUrl = async () => {
    const bridge = window.chrome?.webview?.hostObjects?.bridge;
    if (!bridge) return "http://localhost:9999/api/v1"; // Fallback for dev
    const root = await bridge.GetBaseUrl();
    return root;
};

const apiClient = {
    async getHierarchy() {
        try {
            const baseUrl = await getBaseUrl();
            const response = await fetch(`${baseUrl}/products/hierarchy`);
            if (!response.ok) throw new Error('Failed to fetch hierarchy');
            const data = await response.json();
            
            // Flatten hierarchy: ProcessPlan -> BeolGroup -> Product (skip BeolOption)
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
        } catch (e) {
            console.error("getHierarchy failed", e);
            return [];
        }
    },

    async getPhotoKeysByProduct(productId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/product/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch photo keys');
        return await response.json();
    },

    async getPhotoKeyDetail(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/${keyId}`);
        if (!response.ok) throw new Error('Failed to fetch photo key detail');
        return await response.json();
    },

    async updatePhotoKey(keyId, data) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/${keyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update photo key');
        return await response.json();
    },

    async deletePhotoKey(keyId) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/${keyId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete photo key');
        return await response.json();
    },

    async checkExistence(partId, tableName, revNo) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/exists/${partId}/${encodeURIComponent(tableName)}/${revNo}`);
        if (!response.ok) throw new Error('Failed to check existence');
        return await response.json();
    },

    async getNextRevision(partId, tableName) {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/photo-keys/next-rev/${partId}/${encodeURIComponent(tableName)}`);
        if (!response.ok) throw new Error('Failed to get next revision');
        return await response.json();
    }
};

window.apiClient = apiClient;
