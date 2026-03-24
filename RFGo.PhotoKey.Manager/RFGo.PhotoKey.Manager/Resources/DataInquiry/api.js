const getBaseUrl = async () => {
    return await window.chrome.webview.hostObjects.bridge.GetBaseUrl();
};

const apiClient = {
    async getHierarchy() {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/products/hierarchy`);
        if (!response.ok) throw new Error('Failed to fetch hierarchy');
        return await response.json();
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
