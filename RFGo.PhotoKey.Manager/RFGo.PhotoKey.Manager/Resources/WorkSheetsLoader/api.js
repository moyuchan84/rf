const BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = {
    async uploadPhotoKey(payload) {
        try {
            const response = await fetch(`${BASE_URL}/photo-keys/upload-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Upload failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getProducts() {
        const response = await fetch(`${BASE_URL}/products/`);
        return await response.json();
    },

    async getHierarchy() {
        const response = await fetch(`${BASE_URL}/products/hierarchy`);
        return await response.json();
    },

    async getRestoreData(keyId) {
        const response = await fetch(`${BASE_URL}/photo-keys/${keyId}`);
        return await response.json();
    },

    async getNextRevision(partid, tableName) {
        const response = await fetch(`${BASE_URL}/photo-keys/next-rev/${partid}/${encodeURIComponent(tableName)}`);
        if (!response.ok) return { next_rev: 1 };
        return await response.json();
    },

    async checkExistence(partid, tableName, revNo) {
        const response = await fetch(`${BASE_URL}/photo-keys/exists/${partid}/${encodeURIComponent(tableName)}/${revNo}`);
        if (!response.ok) return { exists: false };
        return await response.json();
    }
};

window.apiClient = apiClient;
